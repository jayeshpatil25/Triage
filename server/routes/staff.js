const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// GET /api/staff - Get all staff
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find();
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/staff - Add new staff (for seeding)
router.post('/', async (req, res) => {
    try {
        const newStaff = new Staff(req.body);
        await newStaff.save();
        res.json(newStaff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/staff/:id/status - Update staff status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const staff = await Staff.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // Emit update if needed
        const io = req.app.get('io');
        if (io) {
            io.emit('STAFF_UPDATE', staff);
        }

        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/staff/:id - Get specific staff member with current patient
router.get('/:id', async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).populate('currentPatient');
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
