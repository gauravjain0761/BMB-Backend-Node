const mongoose = require('mongoose');
const registrationModel = require("../models/rgistration.model");
const eventModel = require("../models/events.model");
const PaymentModel = require("../models/payment.model");
const { successResponse, errorResponse } = require("../helpers/response");
const Razorpay = require('razorpay');
let KEY_ID = process.env.RAZORPAY_KEY_ID_TEST;
let KEY_SECRET = process.env.RAZORPAY_KEY_SECRET_TEST;

var instance = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET,
});


exports.createRegistration = async (req, res) => {
    try {
        console.log('createRegistration api called.');
        let user = req.userData;
        let { eventId, members, totalAmount } = req.body;
        if (eventId && eventId != "") {
            await eventModel.findOne({ _id: eventId }).then(async (docs) => {
                if (docs) {
                    let registrations = await registrationModel.find().sort({ created_at: -1 })
                    function reg_num(value) {
                        let num = "";
                        let increment = (parseInt(value.split("-")[1]) + 1).toString();
                        for (let i = 0; i < 5 - increment.length; i++) {
                            num = num + "0";
                        }
                        return num + increment;
                    }
                    let obj = {
                        doctorId: mongoose.Types.ObjectId(user._id),
                        eventId: mongoose.Types.ObjectId(eventId),
                        eventName: docs?.title,
                        reg_num: registrations.length === 0 ? `BMB-00001` : `BMB-${reg_num(registrations[0].reg_num)}`,
                        doctor_name: user?.title,
                        email: user?.email,
                        contact_number: user?.contact_number,
                        members: members,
                        membersCount: members.length,
                        eventData: docs?.date,
                        eventFee: docs.bookingAmount,
                        sponsors: docs?.sponsers,
                        totalAmount: totalAmount,
                        organiser: docs?.organiser,
                        status: "PENDING",
                    }
                    await registrationModel(obj).save().then((docs) => {
                        successResponse(201, "registraiton created successfully", docs, res)
                    }).catch((err) => { errorResponse(422, err.message, res) })
                } else {
                    errorResponse(422, "Event not found", res);
                }
            }).catch((error) => {
                console.log('error', error);
            })

        } else {
            errorResponse(422, "Please select an event.", res);
        }
    } catch (error) {
        console.log('error creating registration', error);
    }
}

exports.getAllRegistrations = async (req, res) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let total = await registrationModel.countDocuments({});
        await registrationModel.find({}).sort({ _id: -1 }).skip(skip).limit(limit).then((docs) => {
            res.status(200).json({
                message: "Registration has been retrieved successfully.",
                status: true,
                data: docs,
                total: total
            })
        }).catch(error => { errorResponse(500, error.message, res) })

    } catch (error) {
        errorResponse(500, error.message, res);
    }
}

exports.getById = async (req, res) => {
    try {
        let id = req.params.id;
        await registrationModel.find({ _id: id }).then((docs) => {
            successResponse(200, "Resgistration has been retrieved.", docs, res)
        }).catch(error => { errorResponse(500, error.message, res) })
    } catch (error) {
        errorResponse(500, error.message, res);
    }
}


// ============================== Make Payment API ==================
exports.makePayment = async (req, res) => {
    let body = req.body; user = req.userData;
    if (user.account_type === "DOCTOR") {
        if (body.reg_id && mongoose.isValidObjectId(body.reg_id)) {

            let orderdata = await registrationModel.findOne({ _id: mongoose.Types.ObjectId(body.reg_id) }).populate({ path: "doctorId", model: "doctors",
             select: ["title", "first_name","last_name", "email", "contact_number"]
             })
            let option = {
                amount: orderdata["_doc"].totalAmount * 100,
                currency: "INR",
                receipt: orderdata["_doc"].reg_num,
                payment_capture: 1
            }
            instance.orders.create(option).then(async (response) => {
                let obj = {
                    reg: orderdata._id,
                    razorpay_order_id: response.id,
                    user: orderdata.doctorId._id,
                    currency: response.currency,
                    receipt: response.receipt,
                    amount: response.amount,
                    payment_status: "PENDING",
                    isActive: true
                }
                    await new PaymentModel(obj).save()
                        .then((docs) => {
                            var order_info = {
                                // key: KEY_ID,
                                order_id: docs.razorpay_order_id,
                                currency: docs.currency,
                                amount: docs.amount,
                                name: `${orderdata.doctorId.first_name} ${orderdata.doctorId.last_name}`,
                                description: "Testing...",
                                image: "https://bmb.fra1.digitaloceanspaces.com/bmb.GALLERY/image_1679916560625.jpeg",
                                prefill: {
                                    name: `${orderdata.doctorId.first_name} ${orderdata.doctorId.last_name}`,
                                    email: orderdata.doctorId["email"],
                                    contact: orderdata.doctorId["contact_number"],
                                },
                                notes: {
                                    address: "Razorpay Corporate Office",
                                },
                                theme: {
                                    color: "#3399cc",
                                },
                            };
                            successResponse(200, "Order has been created successfully", { ...docs["_doc"], order_info: order_info }, res)
             })
             })
        } else {
            errorResponse(422, "Invalid registration Id", res)
        }
    } else {
        errorResponse(422, "Unauthorized user", res)
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        // let secret_key = "ClrflAfEoO98EuAbqU74n18a";
           let docs = req.body.payload.payment.entity;
        if (docs.status === "captured") {
            let update = {
                payment_status: "CONFIRMED"
            }
            await PaymentModel.findOneAndUpdate({ razorpay_order_id: docs.order_id }, { $set: update }).then((doc) => {
                res.status(200).json({status :true});
            })
        }
    } catch (err) {
        errorResponse(500, err.message, res)
    }
}