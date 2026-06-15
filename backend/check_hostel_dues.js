const mongoose = require("mongoose");
const Due = require("./models/Due");

const MONGO_URI = process.env.MONGO_URI;

async function checkHostelDues() {
    await mongoose.connect(MONGO_URI);
    const count = await Due.countDocuments({ feeSection: "69c1e4a9fa56c5fbd4f36fa5" });
    console.log("Total dues for Hostel Section:", count);
    const sample = await Due.find({ feeSection: "69c1e4a9fa56c5fbd4f36fa5" }).limit(5);
    console.log("Sample:", JSON.stringify(sample, null, 2));
    process.exit(0);
}
checkHostelDues();
