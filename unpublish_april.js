const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });

const MonthlyBill = require("./backend/models/MonthlyBill");
const Due = require("./backend/models/Due");
const FeeSection = require("./backend/models/FeeSection");

async function unpublish() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);

    const month = "2026-04";

    // 1. Update MonthlyBill
    const bill = await MonthlyBill.findOneAndUpdate(
      { month },
      { published: false, publishedAt: null },
      { new: true }
    );

    if (bill) {
      console.log(`Updated MonthlyBill for ${month}: published=false`);
    } else {
      console.log(`No MonthlyBill found for ${month}`);
    }

    // 2. Find Mess FeeSection ID
    const messFs = await FeeSection.findOne({ name: "Mess" });
    if (!messFs) {
      console.log("Mess FeeSection not found");
      process.exit(0);
    }

    // 3. Delete Dues
    const result = await Due.deleteMany({
      feeSection: messFs._id,
      remark: `${month} Mess Bill`
    });

    console.log(`Deleted ${result.deletedCount} dues for ${month} Mess Bill`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

unpublish();
