const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const sponsersSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    weblink: {
        type: String,
    },
    image: { type: String, },
    isActive: {
        type: Boolean,
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('sponsers', sponsersSchema)