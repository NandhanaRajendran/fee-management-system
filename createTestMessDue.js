require("dotenv").config({ path: "./backend/.env" });
const connectDB = require("./backend/config/db");
const Due = require("./backend/models/Due");
const Student = require("./backend/models/Student");
const FeeSection = require("./backend/models/FeeSection");

async function check() {
  await connectDB();
  
  let messFs = await FeeSection.findOne({ name: "Mess" });
  if (!messFs) {
    messFs = await FeeSection.create({ name: "Mess", applicableDepartments: [] });
  }

  const student = await Student.findOne({});
  if (student) {
      await Due.create({
        student: student._id,
        feeSection: messFs._id,
        amount: 500,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Next month
        status: "pending",
        remark: `Test Mess Bill`,
        addedBy: "messManager"
      });
      console.log("Created a test due for student: " + student.name);
  }
  process.exit(0);
}
check();
