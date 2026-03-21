const mongoose = require("mongoose");

const dueSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    feeSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeSection",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Due", dueSchema);