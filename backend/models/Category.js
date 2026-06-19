const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,

            unique: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        icon: {
            type: String,
            default: "📚"
        },

        coverImage: {
            type: String,
            default: ""
        },

        noteCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Fast search
categorySchema.index({
    name: "text",
    description: "text"
});

// Popular categories
categorySchema.index({
    noteCount: -1
});


module.exports = mongoose.model(
    "Category",
    categorySchema
);