const mongoose = require('mongoose');
const registrationModel = require("../models/rgistration.model");
const eventModel = require("../models/events.model");
const { successResponse, errorResponse } = require("../helpers/response");

exports.createRegistration = async (req, res) => {
    try {
        console.log('createRegistration api called.');
        let user = req.userData;
        let { eventId, members } = req.body;
        if (eventId && eventId != "") {
            await eventModel.findOne({ _id: eventId }).then((docs) => {
                if (docs) {
                    let obj = {
                        doctorId: mongoose.Types.ObjectId(user._id),
                        eventId: mongoose.Types.ObjectId(eventId),
                        doctor_name: user?.title,
                        email: user?.email,
                        contact_number: user?.contact_number,
                        members: members,
                        membersCount: members.length,
                        bookingAmount: docs.bookingAmount,
                        totalAmount: docs.bookingAmount * members.length,
                        sponsers: docs?.sponsers,
                        organiser: docs?.organiser,
                        status: "PENDING",
                        payment_status: "PENDING"
                    }
                } else {
                    errorResponse(422, "Event not found", res);
                }
            }).catch((error) => {
                console.log('error', error);
            })

        } else {
            errorResponse(422, "Please select an event.", res);
        }
    } catch (error) {
        console.log('error creating registration', error);
    }
}

exports.getAllRegistrations = async (req, res) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let total = await registrationModel.countDocuments({});
        await registrationModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).then((docs) => {
            res.status(200).json({
                message: "Registration has been retrieved successfully.",
                status: true,
                data: docs,
                total: total
            })
        }).catch(error => { errorResponse(500, error.message, res) })

    } catch (error) {
        errorResponse(500, error.message, res);
    }
}

exports.getById = async (req, res) => {
    try {
        let id = req.params.id;
        await registrationModel.find({ _id: id }).then((docs) => {
            successResponse(200, "Resgistration has been retrieved.", docs, res)
        }).catch(error => { errorResponse(500, error.message, res) })
    } catch (error) {
        errorResponse(500, error.message, res);
    }
}