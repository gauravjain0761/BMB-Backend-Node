const mongoose = require('mongoose');
const announcementModel = require('../models/announcements.model');
const { successResponse, errorResponse } = require('../helpers/response');


exports.createannouncement = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { title, date, link, content, image } = req.body;
            let data = {};
            data.title = title,
                data.date = date,
                data.link = link,
                data.content = content,
                data.image = image;
            data.isActive = false;
            await announcementModel(data).save().then((docs) => {
                console.log('docs', docs);
                successResponse(201, "Announcement saved successfully", docs, res)
            }).catch(error => {
                console.log('error', error);
                errorResponse(422, error.message, res);
            })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) {
        console.log('error creating announcement', err);
    }
}

exports.getAllAnnouncements = async (req, res) => {
    try {
        await announcementModel.find({ isActive: true }).sort({ _id: -1 }).then(docs => {
            successResponse(200, "Announcement retrieved successfully", docs, res);
        }).catch(error => errorResponse(422, error.message, res))
    } catch (error) {
        console.log('error getting announcement', error);
    }
}

exports.updateAnnouncement = async (req, res) => {
    let user = req.userData;
    let Id = req.params.id;
    try {
        if (user.account_type == "ADMIN") {
            let updatedData = {};
            if (req.body.title && req.body.title != "") {
                updatedData.title = req.body.title;
            }
            if (req.body.isActive && req.body.isActive != "") {
                updatedData.isActive = req.body.isActive;
            }
            if (req.body.link && req.body.link != "") {
                updatedData.link = req.body.link;
            }
            if (req.body.date && req.body.date != "") {
                updatedData.date = req.body.date;
            }
            if (req.body.image && req.body.image != "") {
                updatedData.image = req.body.image;
            }
            if (req.body.content && req.body.content != "") {
                updatedData.content = req.body.content;
            }
            await announcementModel.findOneAndUpdate({ _id: Id }, { $set: updatedData }).then((docs) => {
                successResponse(200, "Announcement updated successfully", {}, res);
            }).catch(error => errorResponse(422, error.message, res)
            )
        } else {

            errorResponse(401, "Authentication failed", res);
        }

    } catch (error) {
        console.log('error updating announcement', error);
    }

}

exports.removeAnnouncement = async (req, res) => {
    let user = req.userData;
    let Id = req.params.id;
    try {
        if (user.account_type == "ADMIN") {
            await announcementModel.findByIdAndRemove({ _id: Id }).then((docs) => {
                successResponse(200, "Announcement removed successfully", {}, res);
            }).catch(error => errorResponse(422, error.message, res)
            )
        } else {
            errorResponse(401, "Authentication failed", res);
        }

    } catch (error) {
        console.log('error updating announcement', error);
    }

}

