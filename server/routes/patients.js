const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { calculateTriageScore } = require('../utils/triageEngine');
const { reorderQueue, setMutationMode, getMutationStatus } = require('../utils/queueManager');

// GET /api/patients/system/status
router.get('/system/status', (req, res) => {
    res.json(getMutationStatus());
});

// POST /api/patients/system/mutation
router.post('/system/mutation', async (req, res) => {
    const { mode, active } = req.body;
    setMutationMode(mode, active);

    // Trigger reorder and update
    const io = req.app.get('io');
    if (io) {
        const updatedQueue = await reorderQueue();
        io.emit('QUEUE_UPDATE', updatedQueue);
        io.emit('SYSTEM_STATUS_UPDATE', getMutationStatus());
    }

    res.json({ success: true, status: getMutationStatus() });
});

// GET /api/patients/queue - Get prioritized queue
router.get('/queue', async (req, res) => {
    try {
        const queue = await reorderQueue();
        res.json(queue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/patients/assign - Manually trigger auto-assignment
router.post('/assign', async (req, res) => {
    try {
        const { assignPendingPatients } = require('../utils/queueManager');
        console.log('🔴 Manual assignment trigger requested');
        const assignments = await assignPendingPatients();

        // Emit updates
        const io = req.app.get('io');
        if (io) {
            const updatedQueue = await reorderQueue();
            io.emit('QUEUE_UPDATE', updatedQueue);
            if (assignments.length > 0) {
                io.emit('ASSIGNMENT_UPDATE', assignments);
                io.emit('STAFF_UPDATE');
            }
        }

        res.json({ success: true, assignments });
    } catch (err) {
        console.error('❌ Manual assignment failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/patients/intake - Register new patient
router.post('/intake', async (req, res) => {
    try {
        const { name, age, gender, symptoms, vitals } = req.body;

        // 1. Calculate Triage Score
        const { score, level, explanation } = await calculateTriageScore({ symptoms: symptoms || [], vitals: vitals || {}, age, gender: gender || 'Male' });

        // 2. Create Patient
        const newPatient = new Patient({
            name,
            age,
            gender,
            symptoms,
            vitals,
            triageScore: score,
            priorityLevel: level,
            explanation
        });

        const savedPatient = await newPatient.save();
        console.log(`✅ Patient registered: ${name} (${level})`);

        // 3. Try auto-assignment
        try {
            const { assignPendingPatients } = require('../utils/queueManager');
            console.log('🔄 Attempting auto-assignment...');
            const assignments = await assignPendingPatients();
            console.log(`✅ Auto-assignment complete. Assigned ${assignments.length} patients:`, assignments);

            // Notify about assignments
            const io = req.app.get('io');
            if (io && assignments.length > 0) {
                io.emit('ASSIGNMENT_UPDATE', assignments);
            }
        } catch (assignErr) {
            console.error('❌ Auto-assignment failed:', assignErr);
        }

        // 4. Emit Socket Event (Queue Update)
        const io = req.app.get('io');
        if (io) {
            const updatedQueue = await reorderQueue();
            io.emit('QUEUE_UPDATE', updatedQueue);

            if (level === 'Critical') {
                io.emit('CRITICAL_ALERT', { message: `New CRITICAL patient: ${name}`, patient: savedPatient });
            }
        }

        res.status(201).json(savedPatient);
    } catch (err) {
        console.error('❌ Patient intake error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/patients/:id/status - Update status (e.g., waiting -> in-consultation)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const patient = await Patient.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // If patient is discharged, free up the doctor
        if (status === 'Discharged' && patient.assignedStaff) {
            const Staff = require('../models/Staff');
            await Staff.findByIdAndUpdate(patient.assignedStaff, {
                status: 'Available',
                currentPatient: null
            });

            // Try to assign pending patients to newly available doctor
            const { assignPendingPatients } = require('../utils/queueManager');
            const assignments = await assignPendingPatients();

            const io = req.app.get('io');
            if (io && assignments.length > 0) {
                io.emit('ASSIGNMENT_UPDATE', assignments);
            }
        }

        // Emit update
        const io = req.app.get('io');
        if (io) {
            const updatedQueue = await reorderQueue();
            io.emit('QUEUE_UPDATE', updatedQueue);
        }

        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
