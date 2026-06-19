const mongoose = require("mongoose");

const downloadHistorySchema =
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },


            note: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Note",
                required: true
            }
        },
        {
            timestamps: true
        }
    );


module.exports = mongoose.model(
    "DownloadHistory",
    downloadHistorySchema
);
