const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true
        },

        customCategory: {
            type: String,
            default: "",
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        fileUrl: {
            type: String,
            required: true
        },

        fileType: {
            type: String,
            default: ""
        },

        fileSize: {
            type: Number,
            default: 0
        },

        thumbnail: {
            type: String,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        downloads: {
            type: Number,
            default: 0
        },

        views: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

// Search optimization
noteSchema.index({
    title: "text",
    subject: "text"
});

// Fast sorting for latest notes
noteSchema.index({
    createdAt: -1
});

module.exports = mongoose.model(
    "Note",
    noteSchema
);