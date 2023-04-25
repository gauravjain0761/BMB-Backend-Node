const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const doctorsModel = require("./doctors.model");

const ceritficateSchema = new mongoose.Schema({
    docId: { type: ObjectId, required: true, ref: doctorsModel },
    isActive: {type: Boolean}
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('certificate', ceritficateSchema)