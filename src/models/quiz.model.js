const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
   url: {
    type: String,
    required: true,
   }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('quiz', Schema)