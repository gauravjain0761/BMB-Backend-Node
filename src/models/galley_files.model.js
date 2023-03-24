const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    url: { type: String, required: true },
    isActive: {type: Boolean, required: true},
    gallery: { type: ObjectId, required: true, ref: "galleries" }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('gallery_files', Schema)