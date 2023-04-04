const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    organiser: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    },
    // time: {
    //     type: String,
    //     required: true
    // },
    bookingAmount: {
        type: Number,
        required: true
    },  
    address: {
        type: String,
        required: true
    },    
    image: { type: String,},
    sponsers: {type: Array, required: true},
    isActive: {
        type: Boolean,
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('events', eventsSchema)