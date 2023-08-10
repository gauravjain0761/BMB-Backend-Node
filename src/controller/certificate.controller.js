const mongoose = require('mongoose');
const certifcateModel = require('../models/certificate.model');
const { successResponse, errorResponse } = require('../helpers/response');
const certificate_filesModel = require('../models/certificate_files.model');
const { existedImageremove } = require("../helpers/imageUpload");

exports.addCertificate = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { docId, files } = req.body;
            let obj = { docId: docId, isActive: true, }
            await certifcateModel(obj).save()
                .then(async (doc) => {
                    if (files.length > 0) {
                        let arr = []
                        for (let file of files) {
                            if (file != "") {
                                let obj = { url: file.url, certId: doc._id, docId: doc.docId }
                                // check file type 
                                let fileExt = file?.url?.split('.').pop();
                                if (fileExt == "pdf") {
                                    obj.fileType = "PDF"
                                } else {
                                    obj.fileType = "IMAGE"
                                }
                                arr.push(obj)
                            }
                        }
                        await certificate_filesModel.insertMany(arr)
                    }
                    successResponse(201, "Certificate has been saved successfully.", {}, res)
                })
                .catch(err => errorResponse(422, err.message, res))
        }
        else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.getall = async (req, res) => {
    try {
        // await certifcateModel.find({ isActive: true }).sort({ _id: -1 })
        //     .populate({ path: "docId", select: ["title"] })
        //     .then((docs) => { successResponse(200, "Certificate retrieved successfully.", docs, res) }).catch(err => errorResponse(422, err.message, res))

        const result = await certifcateModel.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: "certificate_files",
                    let : { certficateId: "$_id" },
                    pipeline: [
                        {
                            $match: { 
                                $expr: { $eq: ["$certId", "$$certficateId"] }
                             }
                        }
                    ],
                    as: "certificate_files"
                }
            },
            {
                $lookup: {
                    from: "doctors",
                    localField: "docId",
                    foreignField: "_id",
                    as: "docId"
                }
            },
            {
                $unwind: "$docId"
            },
            {
                $sort: { created_at: -1 }
            },
            {
                $project: {
                    _id: 1,
                    docId: {
                        _id: 1,
                        title: 1    
                    },
                    certificate_files: 1,
                    isActive: 1,
                    created_at: 1,
                    updated_at: 1
                }
            }
        ])

      return  successResponse(200, "Certificate retrieved successfully.", result, res)
                            
    }
    catch (err) { console.log('error', err) }
}

exports.editCertificate = async (req, res) => {
    let user = req.userData;
    let updateId = req.params.id;
    try {
        if (user.account_type == "ADMIN") {
            let { files, docId } = req.body;
            await certifcateModel.findOne({ _id: updateId }).then(async (docs) => {
                if (files.length > 0) {
                    let arr = []
                    for (let file of files) {
                        if (file != "" && !file._id) {
                            let obj = { url: file.url, certId: docs._id, docId: docs.docId };
                            // check file type
                            let fileExt = file?.url?.split('.').pop();
                            if (fileExt == "pdf") {
                                obj.fileType = "PDF"
                            } else {
                                obj.fileType = "IMAGE"
                            }
                            arr.push(obj)
                        }
                    }
                    await certificate_filesModel.insertMany(arr)
                }
                successResponse(200, "Certificate has been updated successfully.", {}, res)
            })
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
            await certificate_filesModel.find({ certId: updateId }).then(async (docs) => {
                if (docs.length > 0) {
                    for (let el of docs) {
                        existedImageremove(el.url);
                        await certificate_filesModel.findByIdAndRemove({ _id: el._id })
                    }
                }
                await certifcateModel.findByIdAndRemove({ _id: updateId }).then(() => {
                    successResponse(200, "certificate has been removed successfully.", {}, res)
                }).catch(err => errorResponse(422, err.message, res))
            }).catch(err => errorResponse(422, err.message, res))
        }
        else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }

}

exports.getCertificateById = async (req, res) => {
    try {
        let paramsId = req.params.id;
        await certifcateModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(paramsId) } },
            {
                $lookup: {
                    from: "doctors",
                    let: { doc: "$docId" },
                    pipeline: [{
                        $match: { $expr: { $eq: ["$_id", "$$doc"] } }
                    }, { $project: { title: 1 } }],
                    as: "docId"
                }
            },
            {
                $lookup: {
                    from: "certificate_files",
                    let: { el: "$_id" },
                    pipeline: [{
                        $match: { $expr: { $eq: ["$certId", "$$el"] } }
                    }, { $project: { url: 1 } }],
                    as: "files"
                }
            },
            { $set: { docId: { $arrayElemAt: ["$docId", 0] } } }
        ])
            .then((docs) => {
                successResponse(200, "Certificate has been retrieved successfully.", docs[0], res);
            }).catch(err => errorResponse(422, err.message, res));
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}


//============================= remove File By Id ==========================//
exports.removecartificatefile = async (req, res) => {
    try {
        let authUser = req.userData; file = req.params.id;
        if (authUser.account_type === "ADMIN") {
            await certificate_filesModel.findOne({ _id: mongoose.Types.ObjectId(file) }).then(async (docs) => {
                if (docs) {
                    existedImageremove(docs["_doc"].url);
                    await certificate_filesModel.deleteOne({ _id: docs["_doc"]._id })
                }
                successResponse(200, "successfull", {}, res)
            }).catch((err) => {
                errorResponse(422, err.message, res)
            })
        }
        else {
            errorResponse(401, "Unauthorized User", res)
        }
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}