const mongoose = require("mongoose");

const MonthlyBillSchema = new mongoose.Schema({
  month: {
    type: String,      // format: "2026-03"
    required: true,
    unique: true,
  },
  drafted: {
    type: Boolean,
    default: false,
  },
  draftedAt: {
    type: Date,
    default: null,
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("MonthlyBill", MonthlyBillSchema);