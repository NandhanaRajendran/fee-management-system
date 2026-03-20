const mongoose = require("mongoose");

const StaffAttendanceSchema = new mongoose.Schema({
  month: {
    type: String,     // "2026-03"
    required: true,
  },
  staffType: {
    type: String,     // "Cook Salary" | "Matron Salary"
    required: true,
  },
  dailyRecords: {
    type: Map,
    of: Boolean,      // { "2026-03-01": true, "2026-03-02": false, ... }
    default: {},
  },
});

StaffAttendanceSchema.index({ month: 1, staffType: 1 }, { unique: true });

module.exports = mongoose.model("StaffAttendance", StaffAttendanceSchema);