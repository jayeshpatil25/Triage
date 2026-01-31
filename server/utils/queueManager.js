const Patient = require('../models/Patient');

/**
 * Re-sorts the Waiting queue based on Priority Level and Triage Score.
 * Also handles starvation by boosting scores of patients waiting too long.
 */
const reorderQueue = async () => {
    // 1. Fetch all waiting patients
    const queue = await Patient.find({ status: 'Waiting' });

    // 2. Sort Logic
    // Sort by: priorityLevel (Critical > Urgent > Semi > Routine) -> Triage Score (Desc) -> Arrival Time (Asc)
    const priorityOrder = { 'Critical': 4, 'Urgent': 3, 'Semi-Urgent': 2, 'Routine': 1 };

    queue.sort((a, b) => {
        let scoreA = a.triageScore;
        let scoreB = b.triageScore;

        // --- MUTATION LOGIC ---
        if (isHighLoadMode && a.priorityLevel === 'Routine') scoreA -= 10;
        if (isHighLoadMode && b.priorityLevel === 'Routine') scoreB -= 10;

        if (isStaffShortageMode && a.priorityLevel === 'Critical') scoreA += 20;
        if (isStaffShortageMode && b.priorityLevel === 'Critical') scoreB += 20;

        const pA = priorityOrder[a.priorityLevel] || 0;
        const pB = priorityOrder[b.priorityLevel] || 0;

        if (pA !== pB) return pB - pA; // Higher priority first
        if (scoreA !== scoreB) return scoreB - scoreA; // Higher score first
        return new Date(a.arrivalTime) - new Date(b.arrivalTime); // First come first serve
    });

    return queue;
};

/**
 * Boosts score of patients waiting longer than threshold to prevent starvation.
 * Typically called on a cron or interval.
 */
const handleStarvation = async () => {
    const waitingPatients = await Patient.find({ status: 'Waiting' });
    const now = new Date();

    for (const p of waitingPatients) {
        const waitTimeMinutes = (now - new Date(p.arrivalTime)) / 60000;

        // Boost logic: +1 score for every 5 minutes waiting
        if (waitTimeMinutes > 15) {
            const boost = Math.floor((waitTimeMinutes - 15) / 5);
            if (boost > 0) {
                p.triageScore += boost;
                // Optionally update explanation
                // await p.save();
            }
        }
    }
};

// --- MUTATION STATE ---
let isHighLoadMode = false;
let isStaffShortageMode = false;

const setMutationMode = (mode, isActive) => {
    if (mode === 'HighLoad') isHighLoadMode = isActive;
    if (mode === 'StaffShortage') isStaffShortageMode = isActive;
};

const getMutationStatus = () => ({
    highLoad: isHighLoadMode,
    staffShortage: isStaffShortageMode
});

/**
 * Auto-assign waiting patients to available doctors
 * Prioritizes critical patients and matches specialization when possible
 */
const assignPendingPatients = async () => {
    const Staff = require('../models/Staff');

    console.log('📋 Starting auto-assignment process...');

    // Get available doctors
    const availableDoctors = await Staff.find({
        role: 'Doctor',
        status: 'Available'
    });

    console.log(`👨‍⚕️ Found ${availableDoctors.length} available doctors:`, availableDoctors.map(d => `${d.name} (${d.specialization?.join(', ') || 'No specialization'})`));

    if (availableDoctors.length === 0) {
        console.log('⚠️ No available doctors - skipping assignment');
        return [];
    }

    // Get waiting patients (sorted by priority)
    const waitingPatients = await reorderQueue();

    console.log(`🏥 Found ${waitingPatients.length} waiting patients:`, waitingPatients.map(p => `${p.name} (${p.priorityLevel}, symptoms: ${p.symptoms?.join(', ') || 'none'})`));

    const assignments = [];

    for (const patient of waitingPatients) {
        if (availableDoctors.length === 0) {
            console.log('⚠️ No more available doctors');
            break;
        }

        let assignedDoctor = null;

        // Try to match by specialization
        if (patient.symptoms && patient.symptoms.length > 0) {
            console.log(`🔍 Trying to match patient ${patient.name} with symptoms: ${patient.symptoms.join(', ')}`);

            // Find a doctor whose specialization matches any of the patient's symptoms
            assignedDoctor = availableDoctors.find(doc => {
                if (!doc.specialization || doc.specialization.length === 0) {
                    console.log(`  ❌ Doctor ${doc.name} has no specialization`);
                    return false;
                }

                const matches = patient.symptoms.some(symptom =>
                    doc.specialization.some(spec =>
                        symptom.toLowerCase().includes(spec.toLowerCase()) ||
                        spec.toLowerCase().includes(symptom.toLowerCase())
                    )
                );

                console.log(`  ${matches ? '✅' : '❌'} Doctor ${doc.name} (${doc.specialization.join(', ')}): ${matches ? 'MATCH' : 'no match'}`);
                return matches;
            });

            if (assignedDoctor) {
                console.log(`✅ Found specialization match: ${assignedDoctor.name}`);
            }
        }

        // If no specialization match, assign to first available doctor
        if (!assignedDoctor) {
            assignedDoctor = availableDoctors[0];
            console.log(`📌 No specialization match, assigning to first available: ${assignedDoctor.name}`);
        }

        if (assignedDoctor) {
            console.log(`🔗 Assigning patient ${patient.name} to doctor ${assignedDoctor.name}`);

            // Update patient
            patient.status = 'In-Consultation';
            patient.assignedStaff = assignedDoctor._id;
            await patient.save();

            // Update doctor
            assignedDoctor.status = 'Busy';
            assignedDoctor.currentPatient = patient._id;
            await assignedDoctor.save();

            // Track assignment
            assignments.push({
                patient: patient.name,
                doctor: assignedDoctor.name,
                matchedSpecialization: assignedDoctor.specialization?.some(spec =>
                    patient.symptoms?.some(symptom =>
                        symptom.toLowerCase().includes(spec.toLowerCase()) ||
                        spec.toLowerCase().includes(symptom.toLowerCase())
                    )
                ) || false
            });

            // Remove doctor from available list
            const index = availableDoctors.indexOf(assignedDoctor);
            availableDoctors.splice(index, 1);

            console.log(`✅ Assignment successful! Remaining available doctors: ${availableDoctors.length}`);
        }
    }

    console.log(`🎉 Auto-assignment complete. Total assignments: ${assignments.length}`);
    return assignments;
};

module.exports = { reorderQueue, handleStarvation, setMutationMode, getMutationStatus, assignPendingPatients };
