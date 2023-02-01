const mongoose = require('mongoose');
const certifcateModel = require('../models/certificate.model');
const { successResponse, errorResponse } = require('../helpers/response');

exports.addCertificate = async (req, res) => {
    console.log('certificate/add api called..');
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { docId, url } = req.body;
            let obj = {
                docId: docId,
                url: url,
                isActive: true,
            }
            await certifcateModel(obj).save().then((docs) => { successResponse(201, "Certificate has been saved successfully.", docs, res) }).catch(err => errorResponse(422, err.message, res))
        }
        else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.getall = async (req, res) => {
    try {
        await certifcateModel.find({ isActive: true }).sort({ _id: -1 })
        .populate({path: "docId", select: ["title"]})
        .then((docs) => { successResponse(200, "Certificate retrieved successfully.", docs, res) }).catch(err => errorResponse(422, err.message, res))
    }
    catch (err) { console.log('error', err) }
}

exports.editCertificate = async (req, res) => {
    let user = req.userData;
    let updateId = req.params.id;
    try {
        if (user.account_type == "ADMIN") {
            let { url, isActive } = req.body;
            let obj = {}
            if (url && url != "") {
                obj["url"] = url;
            }
            if (isActive) {
                obj["isActive"] = isActive;
            }
            await certifcateModel.findByIdAndUpdate({ _id: updateId }, { $set: obj }).then((docs) => { successResponse(200, "Certificate has been updated successfully.", {}, res) }).catch(err => errorResponse(422, err.message, res))
        }
        else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.removecertificate = async (req, res) => {
    let user = req.userData;
    let updateId = req.params.id;
    try {
        if (user.account_type == "ADMIN") {
            await certifcateModel.findByIdAndRemove({ _id: updateId }).then(() => {
                successResponse(200, "certificate has been removed successfully.", {}, res)
            }).catch(err => errorResponse(422, err.message, res))
        }
        else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }

}