const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    },

    advisors: [
        {
            className: String,
            faculty: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Faculty"
            }
        }
    ],
    username : {
        type : String,
        default : null,
    },

    password: {
        type : String,
        default : null,
    },
    

}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);