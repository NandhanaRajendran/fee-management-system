const express = require("express");
const router  = express.Router();
const StaffAttendance = require("../models/StaffAttendance");

// GET staff attendance for a month
router.get("/:month", async (req, res) => {
  try {
    const records = await StaffAttendance.find({ month: req.params.month });
    // Convert Map to plain object for frontend
    const result = records.map((r) => ({
      staffType:    r.staffType,
      month:        r.month,
      dailyRecords: Object.fromEntries(r.dailyRecords),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — save/update daily records for a staff in a month
router.post("/", async (req, res) => {
  try {
    const { month, staffType, dailyRecords } = req.body;
    if (!month || !staffType) {
      return res.status(400).json({ message: "month and staffType are required" });
    }
    const doc = await StaffAttendance.findOneAndUpdate(
      { month, staffType },
      { dailyRecords },
      { upsert: true, new: true }
    );
    res.json({ staffType: doc.staffType, month: doc.month, dailyRecords: Object.fromEntries(doc.dailyRecords) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;