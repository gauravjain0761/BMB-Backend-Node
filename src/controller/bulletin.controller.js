const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const bulletinModel = require('../models/bulletin.model');

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

        return successResponse(200, 'Bulletin added successfully', result, res);

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
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    bulletins: { $push: "$$ROOT" }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        return successResponse(200, 'Bulletin list', bulletin, res);
    } catch (err) {
        console.log('error', err)
        return errorResponse(500, 'Something went wrong', res);
    }
}

