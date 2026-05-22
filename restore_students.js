const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const Student = require("./backend/models/Student");
const User = require("./backend/models/User");

async function restore() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);

    const deptId = "69bd51df6ee27565c05134ed"; // CS&E

    const studentsToCreate = [
      {
        name: "Student 4001",
        admissionNo: "4001",
        department: deptId,
        className: "S3",
        batch: "2024-2026",
        email: "student4001@example.com",
        hostelName: "Men's Hostel",
        room: "101",
        attendance: [
          { date: "2026-04-04", present: true, messCut: true }
        ]
      },
      {
        name: "Student 5000",
        admissionNo: "5000",
        department: deptId,
        className: "S3",
        batch: "2024-2026",
        email: "student5000@example.com",
        hostelName: "Men's Hostel",
        room: "102",
        attendance: [
          { date: "2026-04-04", present: true, messCut: false }
        ]
      }
    ];

    for (const data of studentsToCreate) {
       let student = await Student.findOne({ admissionNo: data.admissionNo });
       if (!student) {
         student = await Student.create(data);
         console.log(`Created student ${data.admissionNo}`);
       }

       let user = await User.findOne({ username: data.admissionNo });
       if (!user) {
         await User.create({
           username: data.admissionNo,
           password: "password123",
           role: "student",
           refId: student._id,
           refModel: "Student"
         });
         console.log(`Created user ${data.admissionNo}`);
       }
    }

    console.log("Restoration complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restore();
