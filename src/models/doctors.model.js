const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const doctorschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    first_name: { type: String, required: true },
    middle_name: { type: String},
    last_name: { type: String, required: true},
    email: {
        type: String,
        // required: true,
        unique: true,
    },
    contact_number: {
        type: String,
        // required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    },
    qualification: {
        type: String,
        required: true 
    },
    speciality: {
        type: String,
        required: true 
    },
    reg_number: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    blood_group: {
        type: String,
        required: true
    },
    home_address: {
        type: String,
    },
    clinic_address: {
        type: String,
    }
    ,
    addOfComunication: {
        type: String,
    },
    docId:{
        type: String,
        required: true,
    }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('doctors', doctorschema)