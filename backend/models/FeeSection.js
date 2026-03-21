const mongoose = require("mongoose");

const feeSectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    applicableDepartments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        }
    ],

    permissions: {
        canAddFee: Boolean,
        canViewDues: Boolean
    }

}, { timestamps: true });

module.exports = mongoose.model("FeeSection", feeSectionSchema);