const mongoose = require("mongoose")
const galleryModel = require("../models/gallery.model");
const galleryFilesModel = require("../models/galley_files.model")
const { errorResponse, successResponse } = require("../helpers/response");
const { existedImageremove } = require("../helpers/imageUpload")
const { verifyKey } = require("../helpers/verifyKey");
const { sendNotification } = require("../helpers/pushNotify");


//============================= Create Gallery ==========================//
exports.createGallery = async (req, res) => {
    try {
        console.log('createGallery api called');
        let authUser = req.userData; let { name, date, files } = req.body;
        if (authUser.account_type === "ADMIN") {
            let obj = { name: name, date: date, isActive: true }
            await new galleryModel(obj).save().then(async (doc) => {
                if (files.length > 0) {
                    let arr = []
                    for (let file of files) {
                        if (file != "") {
                            let obj = { url: file, gallery: doc._id, isActive: true }
                            arr.push(obj)
                        }
                    }
                    await galleryFilesModel.insertMany(arr)
                }
                successResponse(200, "Create successfull", doc, res);


               // send notification

               const message = {
                title: "🌟 Don't miss out on these incredible snapshots!",
                body: `Check ${name} magical moments of recent bMb event! 🤩📸`,
                sound: "default",
                type : "gallery"
               };

               sendNotification(message);

            }).catch((err) => {
                errorResponse(422, err.message, res)
            })
        } else {
            errorResponse(401, "Unauthorized User", res)
        }
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}

//============================= Get all Gallery ==========================//
exports.getAllGallery = async (req, res) => {
    try {
        await galleryModel.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "gallery_files",
                    let: { id: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$gallery", "$$id"] } } },
                        { $project: { url: 1, isActive: 1 } }
                    ],
                    as: "files"
                }
            }
        ]).then((docs) => {
            successResponse(200, "successfull", docs, res)
        }).catch((err) => {
            errorResponse(422, err.message, res)
        })
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}

//============================= get Gallery By Id ==========================//
exports.getGallerybyId = async (req, res) => {
    try {
        let galleryId = req.params.id
        await galleryModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(galleryId), isActive: true } },
            {
                $lookup: {
                    from: "gallery_files",
                    let: { id: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$gallery", "$$id"] } } },
                        { $project: { url: 1, isActive: 1 } }
                    ],
                    as: "files"
                }
            }
        ]).then((docs) => {
            successResponse(200, "successfull", docs[0], res)
        }).catch((err) => {
            errorResponse(422, err.message, res)
        })
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}

//============================= remove Gallery By Id ==========================//
exports.removeGallery = async (req, res) => {
    try {
        let authUser = req.userData; galleryId = req.params.id;
        if (authUser.account_type === "ADMIN") {
            await galleryModel.deleteOne({ _id: mongoose.Types.ObjectId(galleryId) }).then(async (docs) => {
                let files = await galleryFilesModel.find({ gallery: mongoose.Types.ObjectId(galleryId) })
                for (let file of files) {
                    existedImageremove(file.url);
                    await galleryFilesModel.deleteOne({ _id: file._id })
                }
                successResponse(200, "successfull", docs, res)
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

//============================= Udpate Gallery ==========================//
exports.updateGallery = async (req, res) => {
    try {
        let authUser = req.userData; body = req.body; update = null; galleryId = req.params.id;
        if (authUser.account_type === "ADMIN") {
            update = await verifyKey(body)
    
            await galleryModel.findByIdAndUpdate({ _id: galleryId }, { $set: update }).then(async(doc) => {
                if (body.files.length > 0) {
                    let arr = []
                    for (let file of body.files) {
                        if (file != "" && !file._id) {
                            let obj = { url: file.url, gallery: doc._id, isActive: true }
                            arr.push(obj)
                        }
                    }
                    await galleryFilesModel.insertMany(arr)
                }
                successResponse(200, "updated successfully", {}, res);
                if (body.files.length > 0) {
 
                }
            }).catch((err) => {
                errorResponse(422, err.message, res)
            })
        } else {
            errorResponse(401, "Unauthorized User", res)
        }
    } catch (err) {
        errorResponse(500, err.message, res);
    }
}
//============================= remove File By Id ==========================//
exports.removeGalleryFile = async (req, res) => {
    try {
        let authUser = req.userData; file = req.params.id;
        if (authUser.account_type === "ADMIN") {
            await galleryFilesModel.findOne({ _id: mongoose.Types.ObjectId(file) }).then(async (docs) => {
                if (docs) {
                    existedImageremove(docs["_doc"].url);
                    await galleryFilesModel.deleteOne({ _id: docs["_doc"]._id })
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