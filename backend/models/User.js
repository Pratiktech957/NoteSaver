const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },


        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        profileImage: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },


        uploadCount: {
            type: Number,
            default: 0
        },

        downloadCount: {
            type: Number,
            default: 0
        },

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true
    }


);

module.exports = mongoose.model(
    "User",
    userSchema
);
