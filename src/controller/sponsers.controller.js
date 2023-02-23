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

exports.getSponsers = async (req, res) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let filter= {};
        if(req.type){filter.isActive = true}
        let total = await sponsersModel.countDocuments(filter);
        await sponsersModel.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).then((docs) => {
            res.status(200).json({
                message: "Sponsers has retrieved successfully.",
                status:true,
                data: docs,
                total : total
            })
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

exports.removeSponser = async (req, res) => {
    try {
        let sponserId = req.params.id;
        let user = req.userData;
        if (user.account_type == "ADMIN") {
            await sponsersModel.findByIdAndRemove({ _id: sponserId }).then((docs) => {
                successResponse(200, "Sponser has been removed successfully", {}, res);
            }).catch(err => {
                errorResponse(422, err.message, res);
            })
        }
        else {
            errorResponse(401, "Authentication failed", res);

        }
    } catch (err) {
        console.log('error', err);
    }
}