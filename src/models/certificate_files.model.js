const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const certificate = require("./certificate.model");
const doctorsModel = require("./doctors.model");

const Schema = new mongoose.Schema({
    url: { type: String, required: true },
    fileType: { type: String },
    certId: { type: ObjectId, required: true, ref: certificate },
    docId: { type: ObjectId, required: true, ref: doctorsModel },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('certificate_files', Schema)