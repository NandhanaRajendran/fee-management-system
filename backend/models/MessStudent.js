const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: String,   
        required: true
    },
    present: {
        type: Boolean,
        default: true
    },
    messCut: {
        type: Boolean,
        default: false
    }
});

const messStudentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        unique: true // prevents duplicate entries
    },

    room: {
        type: String,
        required: true
    },

    attendance: [attendanceSchema]

}, { timestamps: true });

// ✅ Correct export
module.exports = mongoose.model('MessStudent', messStudentSchema);