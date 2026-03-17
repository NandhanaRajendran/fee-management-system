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

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },

    attendance: [attendanceSchema]

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);