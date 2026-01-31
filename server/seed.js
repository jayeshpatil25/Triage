const mongoose = require('mongoose');
const Patient = require('./models/Patient'); // Adjust path if running from root
const Staff = require('./models/Staff');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hacknagpur-triage";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB under seed script');
        seedData();
    })
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        await Patient.deleteMany({});
        await Staff.deleteMany({});

        const patients = [
            {
                name: 'John Doe',
                age: 45,
                gender: 'Male',
                symptoms: ['mild fever', 'cough'],
                vitals: { temperature: 37.8, spo2: 98, bloodPressure: '120/80' },
                triageScore: 10,
                priorityLevel: 'Routine',
                explanation: 'Mild fever',
                status: 'Waiting',
                arrivalTime: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
            },
            {
                name: 'Alice Smith',
                age: 62,
                gender: 'Female',
                symptoms: ['chest pain', 'shortness of breath'],
                vitals: { temperature: 36.5, spo2: 88, bloodPressure: '160/95' },
                triageScore: 85,
                priorityLevel: 'Critical',
                explanation: 'Critical symptom: chest pain; Low SpO2 (<90%)',
                status: 'Waiting',
                arrivalTime: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
            },
            {
                name: 'Bob Jones',
                age: 28,
                gender: 'Male',
                symptoms: ['broken bone', 'severe pain'],
                vitals: { temperature: 37.0, spo2: 99, bloodPressure: '130/85' },
                triageScore: 30,
                priorityLevel: 'Urgent',
                explanation: 'Urgent: broken bone',
                status: 'Waiting',
                arrivalTime: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
            }
        ];

        await Patient.insertMany(patients);

        const staff = [
            { name: 'Dr. Emily Stone', role: 'Doctor', status: 'Available' },
            { name: 'Dr. Mark House', role: 'Doctor', status: 'Busy' },
            { name: 'Nurse Joy', role: 'Nurse', status: 'Available' }
        ];

        await Staff.insertMany(staff);

        console.log('Data seeded successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
