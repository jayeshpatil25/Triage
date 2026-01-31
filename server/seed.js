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

        // Start with NO patients - they will be added via UI to test auto-assignment
        console.log('Starting with empty patient queue for testing');

        const staff = [
            { name: 'Dr. Emily Stone', role: 'Doctor', status: 'Available', specialization: ['Cardiology', 'Chest Pain', 'Stroke Symptoms'] },
            { name: 'Dr. Mark House', role: 'Doctor', status: 'Available', specialization: ['General Medicine', 'Fever', 'Headache'] },
            { name: 'Dr. Sarah Williams', role: 'Doctor', status: 'Available', specialization: ['Orthopedics', 'Broken Bone', 'Fracture'] },
            { name: 'Nurse Joy', role: 'Nurse', status: 'Available' }
        ];

        await Staff.insertMany(staff);

        console.log('✅ Data seeded successfully');
        console.log('👨‍⚕️ 3 doctors available');
        console.log('🏥 0 patients waiting');
        console.log('📝 Ready to test auto-assignment via Patient Intake');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
