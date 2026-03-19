const mongoose = require("mongoose");

const MonthlyBalanceSchema = new mongoose.Schema({
  month: {
    type: String,   // format: "2026-03"
    required: true,
    unique: true,
  },
  prevBalance: {
    type: Number,
    default: 0,
  },
  closingBalance: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("MonthlyBalance", MonthlyBalanceSchema);