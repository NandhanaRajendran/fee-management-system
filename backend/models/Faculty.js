const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    facultyId: {
        type: String,
        required: true,
        unique: true
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "faculty"
    }

}, { timestamps: true });

module.exports = mongoose.model("Faculty", facultySchema);