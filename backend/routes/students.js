const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET students by room
router.get('/room/:room', async (req, res) => {
    try {
        const students = await Student.find({ room: req.params.room });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update attendance or mess cut
router.put('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (req.body.attendanceRecords) {
            student.attendanceRecords = new Map(Object.entries(req.body.attendanceRecords));
        }

        if (req.body.messCutRecords) {
            student.messCutRecords = new Map(Object.entries(req.body.messCutRecords));
        }

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
