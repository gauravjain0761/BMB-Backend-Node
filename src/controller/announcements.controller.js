const mongoose = require('mongoose');
const announcementModel = require('../models/announcements.model');
const { successResponse, errorResponse } = require('../helpers/response');
const { verifyKey } = require("../helpers/verifyKey")


exports.createannouncement = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { title, date, link, content, image, city, state } = req.body;
            let data = {};
            data.title = title;
            data.date = date;
            data.link = link;
            data.content = content;
            data.image = image;
            data.city = city;
            data.state = state;
            data.isActive = true;
            await announcementModel(data).save().then((docs) => {
                successResponse(201, "Announcement saved successfully", docs, res)
            }).catch(error => {
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
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let filter= {};
        if(req.type){filter.isActive = true}
        let total = await announcementModel.countDocuments(filter);
        await announcementModel.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).then(docs => {
            res.status(200).json({
                message: "Announcement retrieved successfully",
                status: true,
                data: docs,
                total: total
            })
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
           let updatedData = await verifyKey(req.body);
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

exports.getAnnouncementById = async (req, res) => {
    try {
        let Id = req.params.id;
        await announcementModel.findOne({ _id: Id }).then(docs =>
            successResponse(200, "Announcement has been retrieved successfully", docs, res));
    } catch (error) {
        errorResponse(500, error.message, res);
    }
}

