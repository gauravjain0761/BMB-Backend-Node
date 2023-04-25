const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const certificate = require("./certificate.model");

const Schema = new mongoose.Schema({
    url: { type: String, required: true },
    certId: { type: ObjectId, required: true, ref: certificate },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('certificate_files', Schema)