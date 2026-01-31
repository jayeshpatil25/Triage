const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['Doctor', 'Nurse'], required: true },
    specialization: [{ type: String }], // Doctor's specialties (e.g., ['Cardiology', 'Chest Pain', 'Stroke Symptoms'])
    status: {
        type: String,
        enum: ['Available', 'Busy', 'On-Break', 'Offline'],
        default: 'Available'
    },
    currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);
