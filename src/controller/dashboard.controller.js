const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const sponsersModel = require('../models/sponsers.model');
const announcementModel = require("../models/announcements.model");


//============================= Dashboard data ==========================//
exports.getDashboardData = async (req, res) => {
    try {
        const promise1 = await announcementModel.find({ isActive: true }).sort({ _id: -1 });
        const promise2 = await sponsersModel.find({ isActive: true }).sort({ _id: -1 });
        const promises = [promise1, promise2];

        Promise.allSettled(promises).
            then((results) => {
                let obj = {
                    announcements: results[0].value,
                    sponsors: results[1].value
                }
                successResponse(200, "Data retrieved successfully", obj, res);                                         
            })
    } catch (err) {
        errorResponse(500, err.response, res);
    }
}
