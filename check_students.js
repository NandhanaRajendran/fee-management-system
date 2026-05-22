const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const Student = require("./backend/models/Student");

async function check() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);

    const students = await Student.find({ admissionNo: { $in: ["4001", "5000"] } });
    console.log("Found students:", students.map(s => s.admissionNo));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
