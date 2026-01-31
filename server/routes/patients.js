const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { calculateTriageScore } = require('../utils/triageEngine');
const { reorderQueue } = require('../utils/queueManager');

// GET /api/patients/queue - Get prioritized queue
router.get('/queue', async (req, res) => {
    try {
        const queue = await reorderQueue();
        res.json(queue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/patients/intake - Register new patient
router.post('/intake', async (req, res) => {
    try {
        const { name, age, gender, symptoms, vitals } = req.body;

        // 1. Calculate Triage Score
        const { score, level, explanation } = calculateTriageScore({ symptoms: symptoms || [], vitals: vitals || {}, age });

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

        // 3. Emit Socket Event (Queue Update)
        const io = req.app.get('io'); // Need to attach io to app in index.js
        if (io) {
            const updatedQueue = await reorderQueue();
            io.emit('QUEUE_UPDATE', updatedQueue);

            if (level === 'Critical') {
                io.emit('CRITICAL_ALERT', { message: `New CRITICAL patient: ${name}`, patient: savedPatient });
            }
        }

        res.status(201).json(savedPatient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/patients/:id/status - Update status (e.g., waiting -> in-consultation)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const patient = await Patient.findByIdAndUpdate(req.params.id, { status }, { new: true });

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
