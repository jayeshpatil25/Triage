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
        const pA = priorityOrder[a.priorityLevel] || 0;
        const pB = priorityOrder[b.priorityLevel] || 0;

        if (pA !== pB) return pB - pA; // Higher priority first
        if (a.triageScore !== b.triageScore) return b.triageScore - a.triageScore; // Higher score first
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

module.exports = { reorderQueue, handleStarvation };
