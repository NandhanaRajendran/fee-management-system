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
router.put("/attendance/:id", async (req, res) => {
  try {
    const { date, present, messCut } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔍 check if date already exists
    const existing = student.attendance.find(a => a.date === date);

    if (existing) {
      existing.present = present;
      existing.messCut = messCut;
    } else {
      student.attendance.push({ date, present, messCut });
    }

    await student.save();

    res.json(student);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
