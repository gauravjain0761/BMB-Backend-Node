const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isActive: { type: Boolean, required: true },
    date: { type: String },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('gallery', Schema)