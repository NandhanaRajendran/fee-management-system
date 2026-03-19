const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    billMonth: {
      type: String,
      required: true,
    },

    bill: {
      type: String,
      default: null,
    },
    isCommon: {
      type: Boolean,
      default: false,
    },

    quantity: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
