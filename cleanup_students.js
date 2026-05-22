const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const Student = require("./backend/models/Student");
const User = require("./backend/models/User");

async function cleanup() {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);

    const keepList = ["4001", "5000"];
    
    // Find students to delete
    const toDelete = await Student.find({ admissionNo: { $nin: keepList } });
    console.log(`Found ${toDelete.length} students to delete.`);

    for (const student of toDelete) {
      console.log(`Deleting student: ${student.name} (${student.admissionNo})`);
      await Student.deleteOne({ _id: student._id });
      // Also delete corresponding user
      await User.deleteOne({ username: student.admissionNo });
    }

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
