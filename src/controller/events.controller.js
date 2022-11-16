const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const eventsModel = require('../models/events.model');


exports.addEvent = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { title, organiser, content, date, time, fees, image, address } = req.body;
            let obj = {
                title: title,
                organiser: organiser,
                content: content,
                date: date,
                time: time,
                fees: fees,
                image: image,
                address: address,
                createdBy: "ADMIN",
                isActive: true,
            }
            await new eventsModel(obj).save().then(docs => {
                successResponse(201, "Event has been created.", docs, res);
            }).catch(err => { errorResponse(422, err.message, res) })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.getEvents = async (req, res) => {
    try {
        await eventsModel.find({ isActive: true }).sort({ _id: -1 }).then((docs) => {
            successResponse(200, "Event has retrieved successfully.", docs, res);
        }).catch(error => { errorResponse(500, error.message, res) })
    } catch (error) {
        console.log('error', error);
    }
}

exports.getEventById = async (req, res) => {
    try {
        let eventId = req.params.id;
        await eventsModel.findOne({ _id: eventId }).then((docs) => { successResponse(200, "Event retrieved successfully", docs, res) }).catch((error) => { errorResponse(422, error.message, res) })
    } catch (error) {
        console.log("error", error);
    }
}

exports.updateEvent = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let eventId = req.params.id;
            let updatedData = {};
            if (req.body.title && req.body.title != "") {
                updatedData.title = req.body.title;
            } 
            if (req.body.organiser && req.body.organiser != "") {
                updatedData.organiser = req.body.organiser;
            } 
            if (req.body.content && req.body.content != "") {
                updatedData.content = req.body.content;
            } 
            if (req.body.fees && req.body.fees != "") {
                updatedData.fees = req.body.fees;
            }
            if (req.body.address && req.body.address != "") {
                updatedData.address = req.body.address;
            } 
            if (req.body.image && req.body.image != "") {
                updatedData.image = req.body.image;
            }
            await eventsModel.findByIdAndUpdate({ _id: eventId }, { $set: updatedData }).then((docs) => { successResponse(200, "Event has been updated successfully", {}, res) }).catch(err => {
                errorResponse(422, err.message, res);
            })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }

}