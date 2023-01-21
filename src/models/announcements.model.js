const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link:{
        type: String,
    },
    date: {
        type: Date,
    },
    content: {
        type: String,
    },
    image: {
        type: String,
    },
    isActive: {
        type: Boolean,
        required: true,
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('announcements', announcementSchema)