const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        note: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note",
            required: true
        },


        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "reviewed",
                "resolved"
            ],
            default: "pending"
        },

        adminComment: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }


);

module.exports = mongoose.model(
    "Report",
    reportSchema
);
