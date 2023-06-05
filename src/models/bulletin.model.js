const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const bulletinSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    author : {
        type: String,
    },
    date : {
        type: Date,
    },
     // upload bulletin pdf
    bulletin_pdf: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('bulletin', bulletinSchema)