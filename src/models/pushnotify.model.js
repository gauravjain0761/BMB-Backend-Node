const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const pushnotifySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('pushnotify', pushnotifySchema)