const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    symptoms: [{ type: String }], // Array of symptom keywords
    vitals: {
        temperature: { type: Number }, // Celsius
        heartRate: { type: Number },   // bpm
        bloodPressure: { type: String }, // e.g., "120/80"
        spo2: { type: Number },        // %
        respiratoryRate: { type: Number }
    },
    triageScore: { type: Number, default: 0 },
    priorityLevel: {
        type: String,
        enum: ['Critical', 'Urgent', 'Semi-Urgent', 'Routine'],
        default: 'Routine'
    },
    explanation: { type: String }, // Explainability for the score
    arrivalTime: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Waiting', 'In-Consultation', 'Discharged', 'Deferred'],
        default: 'Waiting'
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
