const mongoose = require('mongoose');
const pushnotifyModel = require('../models/pushnotify.model');
const { successResponse, errorResponse } = require('../helpers/response');

exports.createNotification = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { content, title, date } = req.body;
            console.log('date', date);
            let updateData = {
                title: title,
                content: content,
                date: date,
                isActive: true
            }
            await pushnotifyModel(updateData).save().then((docs) => {
                successResponse(201, "Notification saved successfully", docs, res);
            }).catch(err => errorResponse(422, err.message, res))
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (error) {
        console.log('error creating notification', error);
    }
}