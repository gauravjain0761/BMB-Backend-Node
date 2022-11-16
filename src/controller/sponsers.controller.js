const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const sponsersModel = require('../models/sponsers.model');

exports.createSponser = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { title, weblink, image } = req.body;
            let obj = {
                title: title,
                image: image,
                weblink: weblink,
                isActive: true
            }
            await new sponsersModel(obj).save().then(docs => {
                successResponse(201, "Sponser has been created.", docs, res);
            }).catch(err => { errorResponse(422, err.message, res) })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.getSposers = async (req, res) => {
    try {
        await sponsersModel.find({ isActive: true }).sort({ _id: -1 }).then((docs) => {
            successResponse(200, "Sponsers has retrieved successfully.", docs, res);
        }).catch(error => { errorResponse(500, error.message, res) })
    } catch (error) {
        console.log('error', error);
    }
}

exports.getSposerById = async (req, res) => {
    try {
        let eventId = req.params.id;
        await sponsersModel.findOne({ _id: eventId }).then((docs) => { successResponse(200, "Sponser retrieved successfully", docs, res) }).catch((error) => { errorResponse(422, error.message, res) })
    } catch (error) {
        console.log("error", error);
    }
}

exports.updateSponser = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let Id = req.params.id;
            let updatedData = {};
            if (req.body.title && req.body.title != "") {
                updatedData.title = req.body.title;
            } 
            if (req.body.weblink && req.body.weblink != "") {
                updatedData.weblink = req.body.weblink;
            } 
            if (req.body.image && req.body.image != "") {
                updatedData.image = req.body.image;
            }
            await sponsersModel.findByIdAndUpdate({ _id: Id }, { $set: updatedData }).then((docs) => { successResponse(200, "Event has been updated successfully", {}, res) }).catch(err => {
                errorResponse(422, err.message, res);
            })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }

}