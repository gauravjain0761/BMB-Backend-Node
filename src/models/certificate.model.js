const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ceritficateSchema = new mongoose.Schema({
    url: { type: String, required: true },
    user: { type: ObjectId, required: true },
    isActive: {
        type: Boolean,
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('certificate', ceritficateSchema)