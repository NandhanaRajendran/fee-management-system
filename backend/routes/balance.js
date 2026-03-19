const express = require("express");
const router = express.Router();
const Balance = require("../models/MonthlyBalance");



// GET balance by month
router.get("/:month", async (req, res) => {
  const data = await Balance.findOne({ month: req.params.month });
  res.json(data || {});
});

// SAVE / UPDATE
router.post("/", async (req, res) => {
  const { month, prevBalance, closingBalance } = req.body;

  const updated = await Balance.findOneAndUpdate(
    { month },
    { prevBalance, closingBalance },
    { new: true, upsert: true }
  );

  res.json(updated);
});

module.exports = router;