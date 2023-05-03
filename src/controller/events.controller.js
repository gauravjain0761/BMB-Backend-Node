const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../helpers/response');
const eventsModel = require('../models/events.model');


exports.addEvent = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let { title, organiser, content, date, time, bookingAmount, image, address, sponsers } = req.body;
            let obj = {
                title: title,
                organiser: organiser,
                content: content,
                date: date,
                // time: time,
                bookingAmount: bookingAmount,
                image: image,
                sponsers: sponsers,
                address: address,
                createdBy: "ADMIN",
                isActive: true,
                sponsers: sponsers,
            }
            await new eventsModel(obj).save().then(docs => {
                successResponse(201, "Event has been created.", docs, res);
            }).catch(err => { errorResponse(422, err.message, res) })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }
}

exports.getEvents = async (req, res) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let filter= {};
        if(req.type){filter.isActive = true}
        let total = await eventsModel.countDocuments(filter);
        await eventsModel.aggregate([
            {$match: filter},
            {$skip: skip},
            {$limit:  limit},
            {
                $lookup: {
                    from: "sponsers",
                    let: { arr: "$sponsers" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$arr"] },
                                isActive: true
                            }
                        },
                    ],
                    as: "sponsers"
                }
            },    
            {$addFields: {status: { $cond: { if: { $gt: [ "$date", new Date()] }, then: "UPCOMING", else: "PAST" } }}}
        ]).sort({ _id: -1 }).then((docs) => {
            res.status(200).json({
                message: "Event has retrieved successfully.",
                status: true,
                data: docs,
                total: total
            })
        }).catch(error => { errorResponse(500, error.message, res) })
    } catch (error) {
        console.log('error', error);
    }
}

exports.getEventById = async (req, res) => {
    try {
        let eventId = req.params.id;
        await eventsModel.aggregate([
              {$match: { _id: mongoose.Types.ObjectId(eventId) }},
              {
                $lookup: {
                    from: "sponsers",
                    let: { arr: "$sponsers" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$arr"] },
                                isActive: true
                            }
                        },
                    ],
                    as: "sponsers"
                }
            }
        ]).then((docs) => { successResponse(200, "Event retrieved successfully", docs[0], res) }).catch((error) => { errorResponse(422, error.message, res) })
    } catch (error) {
        console.log("error", error);
    }
}

exports.updateEvent = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            let eventId = req.params.id;
            let updatedData = {};
            if (req.body.title && req.body.title != "") {
                updatedData.title = req.body.title;
            }
            if (req.body.organiser && req.body.organiser != "") {
                updatedData.organiser = req.body.organiser;
            }
            if (req.body.content && req.body.content != "") {
                updatedData.content = req.body.content;
            }
            if (req.body.bookingAmount && req.body.bookingAmount != "") {
                updatedData.bookingAmount = req.body.bookingAmount;
            }
            if (req.body.address && req.body.address != "") {
                updatedData.address = req.body.address;
            }
            if (req.body.image && req.body.image != "") {
                updatedData.image = req.body.image;
            }
            if (req.body.sponsers && req.body.sponsers != "") {
                updatedData.sponsers = req.body.sponsers.map(el => {return mongoose.Types.ObjectId(el)});
            }
            await eventsModel.findByIdAndUpdate({ _id: eventId }, { $set: updatedData }).then((docs) => { successResponse(200, "Event has been updated successfully", docs, res) }).catch(err => {
                errorResponse(422, err.message, res);
            })
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (err) { console.log('error', err) }

}

exports.removeEvent = async (req, res) => {
    try {
        let eventId = req.params.id;
        let user = req.userData;
        if (user.account_type == "ADMIN") {
            console.log('eventId', eventId, user);
            await eventsModel.findByIdAndRemove({ _id: eventId }).then((docs) => {
                successResponse(200, "Event has been removed successfully", {}, res);
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