const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const doctorschema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    first_name: { type: String, required: true },
    middle_name: { type: String},
    last_name: { type: String,},
    email: {
        type: String,
        unique: true,
    },
    contact_number: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    isApproved: {
        type: String,
        required: true,
        enum : ["PENDING", "APPROVED", "REJECTED"]
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
    marriage_date: {
        type: String,
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
    },
    account_type: {
      type : String,
      required: true,    
    },
    image:{
        type: String,
    },
    degree_certificate:{
        type : String,
    },
    mmc_certificate:{
        type : String,
    },
    address: {
        type : String,
    },
    state: {
        type : String,
    },
    otp :{
        type: Number
    },
    fcmToken: {
        type: String,
        default: ''
    },
    life_time_membership_number: {
        type: String,
    },
    web_token: {type: String},
    app_token: {type: String},
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

module.exports = mongoose.model('doctors', doctorschema)