const mongoose = require("mongoose");
const connectDB = require("./backend/config/db");
const Due = require("./backend/models/Due");

async function run() {
  await connectDB();
  const dues = await Due.find()
      .populate("feeSection", "name category")
      .populate({
        path: "student",
        select: "name admissionNo className department",
        populate: { path: "department", select: "name" }
      })
      .populate({
        path: "addedByRef",
        select: "name department",
        populate: { path: "department", select: "name" }
      }).limit(5);
      
  console.log(JSON.stringify(dues.map(d => ({
    _id: d._id,
    amount: d.amount,
    addedBy: d.addedBy,
    addedByRef: d.addedByRef,
    feeSection: d.feeSection,
    due_obj: d.toObject()
  })), null, 2));
  process.exit();
}

run().catch(console.error);
