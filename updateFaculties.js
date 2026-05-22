require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const Faculty = require("./backend/models/Faculty");
const User = require("./backend/models/User");
const connectDB = require("./backend/config/db");

async function run() {
  await connectDB();
  const faculties = await Faculty.find({});
  let i = 1000;
  for (let f of faculties) {
    if (!f.facultyId) {
      const assignedId = "FAC" + i++;
      f.facultyId = assignedId;
      await f.save();
    }
  }
  console.log("Updated existing faculties with facultyId");
  process.exit();
}

run().catch(console.error);
