const express = require("express");
const router = express.Router();
const MonthlyBill = require("../models/MonthlyBill");

// GET status for a month
router.get("/:month", async (req, res) => {
  try {
    const doc = await MonthlyBill.findOne({ month: req.params.month });
    res.json(doc || { month: req.params.month, drafted: false, published: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — send draft
router.post("/draft", async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) return res.status(400).json({ message: "Month is required" });

    const doc = await MonthlyBill.findOneAndUpdate(
      { month },
      { drafted: true, draftedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — publish (only allowed if drafted first)
router.post("/publish", async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) return res.status(400).json({ message: "Month is required" });

    const existing = await MonthlyBill.findOne({ month });
    if (!existing?.drafted) {
      return res.status(400).json({ message: "Draft must be sent before publishing" });
    }

    const doc = await MonthlyBill.findOneAndUpdate(
      { month },
      { published: true, publishedAt: new Date() },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;