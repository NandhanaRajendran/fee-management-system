const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    admissionNo: {
      type: String,
      required: true,
      unique: true,
      match: /^[1-9][0-9]{3,}$/,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    className: {
      type: String, // S1, S2, etc
      required: true,
    },

    batch: {
      type: String, // Example: 2024-2028
    },

    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
