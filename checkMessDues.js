require("dotenv").config({ path: "./backend/.env" });
const connectDB = require("./backend/config/db");
const Due = require("./backend/models/Due");
const FeeSection = require("./backend/models/FeeSection");

async function check() {
  await connectDB();
  const fs = await FeeSection.find({});
  console.log("Fee Sections: ", fs.map(f => f.name));
  
  const messFs = fs.find(f => f.name.toLowerCase().includes("mess"));
  if (messFs) {
     const dues = await Due.find({ feeSection: messFs._id });
     console.log("Mess Dues: ", dues.length);
  }
  process.exit(0);
}
check();
