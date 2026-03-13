const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    attendanceRecords: {
        type: Map,
        of: Boolean,
        default: {},
    },
    messCutRecords: {
        type: Map,
        of: Boolean,
        default: {},
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
