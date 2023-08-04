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
    link : {
        type: String,
        required: false
    },
    date: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('pushnotify', pushnotifySchema)