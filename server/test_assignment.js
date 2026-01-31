// Test script to check database state and trigger manual assignment
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Staff = require('./models/Staff');
const { assignPendingPatients } = require('./utils/queueManager');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hacknagpur-triage";

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Check staff
        const allStaff = await Staff.find({});
        console.log('\n📊 All Staff in Database:');
        allStaff.forEach(s => {
            console.log(`  - ${s.name} (${s.role}): ${s.status}, Specialization: ${s.specialization?.join(', ') || 'None'}`);
        });

        const availableDoctors = await Staff.find({ role: 'Doctor', status: 'Available' });
        console.log(`\n👨‍⚕️ Available Doctors: ${availableDoctors.length}`);

        // Check patients
        const waitingPatients = await Patient.find({ status: 'Waiting' });
        console.log(`\n🏥 Waiting Patients: ${waitingPatients.length}`);
        waitingPatients.forEach(p => {
            console.log(`  - ${p.name} (${p.priorityLevel}): ${p.symptoms?.join(', ') || 'No symptoms'}`);
        });

        // Try manual assignment
        console.log('\n🔄 Attempting manual auto-assignment...');
        const assignments = await assignPendingPatients();
        console.log(`\n✅ Assignment result:`, assignments);

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
