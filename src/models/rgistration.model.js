const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    doctorId: { type: ObjectId, required: true },
    doctor_name: { type: String, required: true },
    email: { type: String, required: true },
    reg_num: { type: String, required: true },
    contact_number: { type: String, required: true },
    eventId: { type: ObjectId, required: true },
    eventData: { type: Object, required: true }, 
    eventFee: { type: String, required: true },
    members: { type: Array, required: true },
    membersCount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    sponsors: { type: Array },
    organiser: { type: 'String', required: true },
    status: { type: String, enum: ['COMPLETED', 'PENDING'], required: true },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('registration', registrationSchema)