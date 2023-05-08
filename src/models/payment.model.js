const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    reg: { type: ObjectId, required: true, ref: "registrations" },
    razorpay_order_id: { type: String, required: true },
    user: { type : ObjectId, required: true, ref: "doctors" },
    currency: { type: String },
    receipt: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_status : {type: String, required: true, enum: ['PENDING', "CONFIRMED", "DECLINED"] },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    isActive: { type: Boolean, required: true }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('payments', Schema)