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

// POST bulk enroll students
router.post('/bulk', async (req, res) => {
    console.log("Bulk enrollment request received. Count:", req.body.students?.length);
    try {
        const { students } = req.body;
        const Department = require('../models/Department');
        const User = require('../models/User');

        const addedStudents = [];
        const errors = [];

        for (const studentData of students) {
            try {
                console.log(`Processing student: ${studentData.admission}`);

                // Find or create department (exact match preferred)
                let dept = await Department.findOne({
                    name: { $regex: new RegExp("^" + (studentData.department || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") }
                });

                if (!dept && studentData.department) {
                    console.log(`Creating new department: ${studentData.department}`);
                    dept = new Department({ name: studentData.department });
                    await dept.save();
                }

                if (!dept) {
                    throw new Error(`Department ${studentData.department} could not be found or created.`);
                }

                let existingStudent = await Student.findOne({ admissionNo: studentData.admission });
                if (existingStudent) {
                    errors.push(`Admission number ${studentData.admission} already exists`);
                    continue;
                }

                const newStudent = new Student({
                    name: studentData.name,
                    admissionNo: studentData.admission,
                    email: studentData.email,
                    department: dept._id,
                    className: studentData.class,
                    batch: studentData.batch,
                    gender: studentData.gender || "Other",
                });

                await newStudent.save();
                console.log(`Student ${studentData.admission} saved.`);

                // Create User account
                const existingUser = await User.findOne({ username: studentData.admission });
                if (!existingUser) {
                    await User.create({
                        username: studentData.admission,
                        password: "password123",
                        role: "student",
                        refId: newStudent._id,
                        refModel: "Student",
                    });
                    console.log(`User ${studentData.admission} created.`);
                }

                addedStudents.push({
                    ...newStudent.toObject(),
                    department: studentData.department
                });
            } catch (innerErr) {
                console.error(`Error enrolling student ${studentData.admission}:`, innerErr.message);
                errors.push(`Row ${studentData.admission || "unknown"}: ${innerErr.message}`);
            }
        }

        res.json({
            message: addedStudents.length > 0 ? "Bulk enrollment completed" : "Bulk enrollment failed",
            addedStudents,
            errors
        });
    } catch (error) {
        console.error("Bulk enrollment fatal error:", error);
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
// GET student by admission number
router.get('/admission/:admissionNo', async (req, res) => {
    try {
        const student = await Student.findOne({ admissionNo: req.params.admissionNo }).populate('department');
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('department');
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// POST enroll student to hostel
router.post('/enroll-hostel', async (req, res) => {
    try {
        const { admission, room, hostelName, name, department, className, gender } = req.body;
        if (!admission) return res.status(400).json({ message: "Admission number / ID is required" });

        let student = await Student.findOne({ admissionNo: admission });

        if (!student) {
            student = new Student({
                admissionNo: admission,
                name: name || "Unknown Inmate",
                department: department || undefined,
                className: className || "N/A",
                email: `${admission}@hostel.local`,
                gender: gender || "Other",
                phone: "0000000000",
                address: "Hostel",
            });
        }

        if (room) student.room = room;
        if (gender) student.gender = gender;

        // If they are being enrolled in a hostel and don't have an enrollment date yet
        if (hostelName && !student.hostelEnrollmentDate) {
            student.hostelEnrollmentDate = new Date();
        }

        student.hostelName = hostelName || "";
        await student.save();

        res.json({ message: "Student enrolled successfully", student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST publish HDF amount
router.post('/hdf', async (req, res) => {
    try {
        const { amount, month, year } = req.body;

        const result = await Student.updateMany(
            {
                hostelName: { $exists: true, $ne: "" },
                room: { $exists: true, $ne: "" }
            },
            {
                $set: {
                    HDF: Number(amount),
                    hdfMonth: month,
                    hdfYear: year,
                    feeUpdatedAt: new Date()
                }
            }
        );

        console.log(result);

        res.json({
            message: "HDF updated",
            result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
// POST publish Rent amount
router.post('/rent', async (req, res) => {
    try {
        const { amount, month, year } = req.body;

        const result = await Student.updateMany(
            {
                hostelName: { $exists: true, $ne: "" },
                room: { $exists: true, $ne: "" }
            },
            {
                $set: {
                    HostelRent: Number(amount),
                    rentMonth: month,
                    rentYear: year,
                    feeUpdatedAt: new Date()
                }
            }
        );

        console.log(result);

        res.json({
            message: "Rent updated",
            result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// PUT update attendance or mess cut
router.put("/attendance/:id", async (req, res) => {
    try {
        const { date, present, messCut, milk } = req.body;
        console.log("BODY:", req.body);
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // 🔍 check if date already exists
        const existing = student.attendance.find((a) => {

            const dbDate =
                new Date(a.date)
                    .toISOString()
                    .slice(0, 10);

            return dbDate === date;
        });

        if (existing) {
            existing.present = present;
            existing.messCut = messCut;

            // milk allowed only if present
            existing.milk = present ? milk : false;
        } else {
            student.attendance.push({
                date,
                present,
                messCut,
                milk: present ? milk : false
            });
        }

        console.log("UPDATED ATTENDANCE:");
        console.log(student.attendance);
        await student.save();

        res.json(student);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE unenroll student from hostel
router.delete("/unenroll/:admissionNo", async (req, res) => {
    try {
        const { admissionNo } = req.params;

        // Try both string and number formats for robustness
        let student = await Student.findOne({ admissionNo: admissionNo });
        if (!student && !isNaN(admissionNo)) {
            student = await Student.findOne({ admissionNo: Number(admissionNo) });
        }

        if (!student) {
            console.log(`Unenrollment failed: Student ${admissionNo} not found.`);
            return res.status(404).json({ message: "Student not found" });
        }

        student.hostelName = "";
        student.room = "";
        await student.save();

        res.json({ message: "Student unenrolled from hostel successfully" });
    } catch (error) {
        console.error("Unenrollment error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

