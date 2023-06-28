const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const bulletinModel = require('../models/bulletin.model');
const { sendCloudNotification } = require('../helpers/pushNotify');
const doctorsModel = require('../models/doctors.model');

exports.addBulletin = async (req, res) => {
    let user = req.userData;
    try {

        const { title, author, date, bulletin_pdf } = req.body;

        if (!title) return errorResponse(422, 'Title is required', res);
        if (!author) return errorResponse(422, 'Author is required', res);
        if (!date) return errorResponse(422, 'Date is required', res);
        if (!bulletin_pdf) return errorResponse(422, 'Bulletin pdf is required', res);

        const bulletinExits = await bulletinModel.findOne({ title: title });
        if (bulletinExits) return errorResponse(400, 'Bulletin already exists', res);

        let bulletin = new bulletinModel(req.body);
        let result = await bulletin.save();

        successResponse(200, 'Bulletin added successfully', result, res);

        // send push notification to all approved doctors
        const doctors = await doctorsModel.find({
            isApproved: "APPROVED", fcmToken: {
                $ne: ''
            }
        }).lean();


        if (doctors.length > 0) {
            for (let ele of doctors) {
                if (ele?.fcmToken) {
                    const message = {
                        title: "📢 Stay Informed with the Latest Bulletin! 🗞️",
                        body: "🌟 Knowledge is power, so empower yourself with the latest bulletin. Stay connected and stay informed! 📲💡",
                        sound: "default",
                        date: String(new Date()),
                        type : "bulletins"
                    };

                    sendCloudNotification(ele.fcmToken, message);
                }
            }
        }



    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Internal server error', res);
    }
}

exports.getAllBulletin = async (req, res) => {
    try {
        let bulletin = await bulletinModel.find();
        return successResponse(200, 'Bulletin list', bulletin, res);
    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Internal server error', res);
    }
}

exports.getBulletinById = async (req, res) => {
    try {
        let bulletin = await bulletinModel.findById(req.params.id);
        return successResponse(200, 'Bulletin details', bulletin, res);
    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Internal server error', res);

    }
}

exports.updateBulletin = async (req, res) => {

    try {
        const { title, author, date, bulletin_pdf } = req.body;

        if (!title) return errorResponse(422, 'Title is required', res);
        if (!author) return errorResponse(422, 'Author is required', res);
        if (!date) return errorResponse(422, 'Date is required', res);
        if (!bulletin_pdf) return errorResponse(422, 'Bulletin pdf is required', res);

        let bulletin = await bulletinModel.findById(req.params.id);
        if (!bulletin) return errorResponse(404, 'Bulletin not found', res);

        const bulletinExits = await bulletinModel.findOne({ title: title, _id: { $ne: req.params.id } });

        if (bulletinExits) return errorResponse(400, 'Bulletin already exists', res);

        bulletin.title = title;
        bulletin.author = author;
        bulletin.date = date;
        bulletin.bulletin_pdf = bulletin_pdf;

        let result = await bulletin.save();
        return successResponse(200, 'Bulletin updated successfully', result, res);

    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Internal server error', res);
    }
}


exports.deleteBulletin = async (req, res) => {
    try {
        let bulletin = await bulletinModel.findByIdAndDelete(req.params.id);
        return successResponse(200, 'Bulletin deleted successfully', bulletin, res);
    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Internal server error', res);
    }
}

exports.getAllBulletinByGroupDate = async (req, res) => {
    try {
        let bulletin = await bulletinModel.aggregate([
            {
                $sort :{
                    date : -1
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    bulletins: { $push: "$$ROOT" }
                }
            },
            {
                $addFields: {
                    monthYear: {
                        $concat: [
                            {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$_id.month", 1] }, then: "January" },
                                        { case: { $eq: ["$_id.month", 2] }, then: "February" },
                                        { case: { $eq: ["$_id.month", 3] }, then: "March" },
                                        { case: { $eq: ["$_id.month", 4] }, then: "April" },
                                        { case: { $eq: ["$_id.month", 5] }, then: "May" },
                                        { case: { $eq: ["$_id.month", 6] }, then: "June" },
                                        { case: { $eq: ["$_id.month", 7] }, then: "July" },
                                        { case: { $eq: ["$_id.month", 8] }, then: "August" },
                                        { case: { $eq: ["$_id.month", 9] }, then: "September" },
                                        { case: { $eq: ["$_id.month", 10] }, then: "October" },
                                        { case: { $eq: ["$_id.month", 11] }, then: "November" },
                                        { case: { $eq: ["$_id.month", 12] }, then: "December" }
                                    ],
                                    default: ""
                                }
                            },
                            " ",
                            { $toString: "$_id.year" }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    monthYear: 1,
                    bulletins: 1
                }
            },
            { $sort: { monthYear: -1 } }
        ]);
        return successResponse(200, 'Bulletin list', bulletin, res);
    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Something went wrong', res);
    }
}



