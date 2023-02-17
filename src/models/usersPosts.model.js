const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: "doctors"
    },
    docs: { type: Array, required: true },
    location: {
        lat: { type: Number, },
        lng: { type: Number, },
        address: { type: String, },
    },
    description: { type: String },
    isActive: { type: Boolean, required: true }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('user_posts', Schema)