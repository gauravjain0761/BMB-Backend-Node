const mongoose = require('mongoose');
const doctorsModel = require('../models/doctors.model');
const userPostsModel = require('../models/usersPosts.model');
var bcrypt = require('bcryptjs');
const saltRounds = process.env.SALT;
const moment = require('moment');
const XLSX = require('xlsx');
const { successResponse, errorResponse } = require('../helpers/response');
const { generateWebToken, } = require('../helpers/jwt');
const axios = require('axios');
const { existedImageremove } = require("../helpers/imageUpload");
const { emailNotify } = require("../helpers/emailNotify");

const { query } = require('express');

function generateId(value) {
  let num = "";
  let increment = (parseInt(value.split("R")[1]) + 1).toString();
  for (let i = 0; i <= 3 - increment.length; i++) {
    num = num + "0";
  }
  return num + increment;
}

//============================= Doctor Register==========================//
exports.register = async (req, res) => {
  try {
    let { first_name, middle_name, last_name, email, address, password, home_address, contact_number, qualification, marriage_date, speciality, reg_number, dob, blood_group, degree_certificate, mmc_certificate, image, state, fcmToken } = req.body;
    let existedRegistration = await doctorsModel.countDocuments({ reg_number: reg_number })
    if (existedRegistration > 0) {
      errorResponse(422, "Registration number already exists", res);
    } else {
      let object = {
        title: middle_name ? `Dr. ${first_name} ${middle_name} ${last_name}` : `Dr. ${first_name} ${last_name}`,
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        email: email,
        contact_number: contact_number,
        qualification: qualification,
        speciality: speciality,
        reg_number: reg_number,
        dob: dob,
        isApproved: "PENDING",
        blood_group: blood_group,
        account_type: "DOCTOR",
        image: image ? image : "",
        home_address: home_address ? home_address : address,
        state: state,
        marriage_date: marriage_date,
        degree_certificate: degree_certificate ? degree_certificate : "",
        mmc_certificate: mmc_certificate ? mmc_certificate : "",
        fcmToken: fcmToken ? fcmToken : "",
      }
      if (password != null && password != '') {
        object.password = bcrypt.hashSync(password, saltRounds);
        let last = await doctorsModel.findOne({}).sort({ _id: -1 }).limit(1).select("docId");
        object.docId = last != null > 0 ? `BMBDR${generateId(last['_doc'].docId)}` : 'BMBDR0001';
        await new doctorsModel(object).save().then(async (docs) => {
          successResponse(201, "Doctor has been registered successfully.", docs, res);
        }).catch(err => {
          errorResponse(422, err.message, res)
        })
      }
    }
  } catch (err) {
    console.log("error---->", err);
  }
}

// //============================= create Doctor Account==========================//

exports.createDoctorAccount = async (req, res) => {
  try {

    const { first_name, middle_name, last_name, contact_number, email } = req.body;

    let existedRegistration = await doctorsModel.findOne({ contact_number });

    if (existedRegistration) {
      return errorResponse(422, "Contact number already exists", res);
    }

    const emailWithDoctorExits = await doctorsModel.findOne({ email });
    if (emailWithDoctorExits) {
      return errorResponse(422, "Email already exists", res);
    }

    const lastDoctorId = await doctorsModel.findOne({}).sort({ _id: -1 }).limit(1).select("docId");

    let object = {
      ...req.body,
      title: middle_name ? `Dr. ${first_name} ${middle_name} ${last_name}` : `Dr. ${first_name} ${last_name}`,
      isApproved: "APPROVED",
      account_type: "DOCTOR",
      docId: lastDoctorId != null > 0 ? `BMBDR${generateId(lastDoctorId['_doc']?.docId)}` : 'BMBDR0001',
      password: bcrypt.hashSync(`BMB2023`, saltRounds)
    }

    await new doctorsModel(object).save();

    return successResponse(201, "Doctor has been registered successfully.", object, res);

  } catch (err) {
    console.log("error---->", err);
    errorResponse(500, err.message, res)
  }

}

//============================= Doctor Login ==========================//
exports.doctorlogin = async (req, res) => {
  try {
    let { username, password, fcmToken } = req.body;
    await doctorsModel.findOne({ $or: [{ email: username }, { contact_number: username }] }).then((docs) => {
      if (!docs) {
        errorResponse(422, "Account does not exists.", res);
      } else {
        if (["PENDING", "REJECTED"].includes(docs.isApproved)) {
          errorResponse(422, "Your Account is not verified. Please contact to support team", res)
        } else {
          if (bcrypt.compareSync(password, docs["_doc"].password) === true) {
            docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
            delete docs["_doc"].otp;
            delete docs["_doc"].password
            successResponse(200, "Login successfully.", docs, res);

            // Update FCM Token
            if (fcmToken) {
              console.log('fcmToken--5555555->', fcmToken);
              doctorsModel.findOneAndUpdate({ _id: docs['_doc']?._id }, { fcmToken: fcmToken, is_first_time_login : false }, { upsert: true, new: true }).then((result) => {
                console.log('result--->', result);
              }).catch((err) => {
                console.log('err--->', err);
              })
            }
          } else {
            errorResponse(422, "Password does not matched.", res)
          }
        }
      }
    }).catch((err) => {
      console.log('error---->', err);
    })
  }
  catch (err) {
    console.log('error--->', err);
  }
}

//============================= Send_OTP ==========================//
exports.send_otp = async (req, res) => {
  try {
    let { username } = req.body;
    await doctorsModel.findOne({ $or: [{ contact_number: username }, { email: username }] }).then(async (doc) => {
      if (!doc) {
        errorResponse(422, "The Number is not registerd.", res)
      } else {
        let otp = 1234;
        await doctorsModel.findByIdAndUpdate({ _id: doc['_doc']._id }, { $set: { otp: otp } }).then((result) => {
          successResponse(200, "An OTP hase been sent to your registered email and mobile number.", { otp: otp }, res)
        }).catch((err) => { errorResponse(422, err.message, res) })
      }
    }).catch((err) => { errorResponse(422, err.message, res) })
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

//============================= verify_otp ==========================//
exports.verify_otp = async (req, res) => {
  try {
    let { username, otp } = req.body; type = req.query.type;
    await doctorsModel.findOne({ $or: [{ contact_number: username }, { email: username }] }).then(async (doc) => {
      if (!doc) {
        errorResponse(422, "The username is not registerd.", res)
      } else {
        if (parseInt(doc.otp) === parseInt(otp)) {
          if (type && type.toUpperCase() === "FORGET") {
            successResponse(200, "OTP match successfully.", {}, res);
          } else {
            doc['_doc'].auth_token = `Bearer ${generateWebToken(doc["_doc"]._id)}`;
            delete doc["_doc"].otp;
            delete doc["_doc"].password;
            successResponse(200, "Login successfully.", doc, res);
          }
        }
        else { errorResponse(406, "Invalid OTP!", res) }
      }
    }).catch((err) => { errorResponse(422, err.message, res) })
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

//============================= Forget password ==========================//
exports.forget_password = async (req, res) => {
  try {
    let { username } = req.body;
    await doctorsModel.findOne({ $or: [{ contact_number: username }, { email: username }] }).then(async (docs) => {
      if (!docs) {
        errorResponse(422, "Account not registered.", res)
      } else {
        if (["PENDING", "REJECTED"].includes(docs.isApproved)) {
          errorResponse(422, "Your Account is not verified. Please contact to support team", res)
        } else {
          let otp = Math.random().toString().slice(-4);
          await doctorsModel.findByIdAndUpdate({ _id: docs['_doc']._id }, { $set: { otp: otp } }).then((result) => {
            emailNotify({ ...result["_doc"], otp: otp }, "forget_password")
            successResponse(200, "An OTP has been sent to your registered email and mobile number.", { otp: otp }, res)
          }).catch((err) => { errorResponse(422, err.message, res) })
        }
      }
    }).catch((err) => { errorResponse(422, err.message, res) })
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

exports.reset_password = async (req, res) => {
  try {
    let { username, password } = req.body; obj = {}
    await doctorsModel.findOne({ $or: [{ contact_number: username }, { email: username }] }).then(async (docs) => {
      if (!docs) {
        errorResponse(422, "Account not registered.", res)
      } else {
        obj.password = bcrypt.hashSync(password, saltRounds);
        await doctorsModel.findByIdAndUpdate({ _id: docs['_doc']._id }, { $set: obj }).then((result) => {
          successResponse(200, "Password updated successfully.", {}, res)
        }).catch((err) => { errorResponse(422, err.message, res) })
      }
    })
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

//============================= Get All Doctor ==========================//
exports.getAllDoctors = async (req, res) => {
  try {
    let filter = {}; qry = req.query ? req.query.q : ""
    if (req.type && req.type === "USER") {
      filter.isApproved = "APPROVED"
    }
    if (qry && qry != "") {
      filter.$or = [
        { title: { $regex: qry, $options: 'i' } },
        { first_name: { $regex: qry, $options: 'i' } },
        { middle_name: { $regex: qry, $options: 'i' } },
        { last_name: { $regex: qry, $options: 'i' } },
      ]
    }
    await doctorsModel.find(filter).sort({ _id: -1 })
      .select("-password -created_at -updated_at -__v -account_type -otp")
      .then(docs => { successResponse(200, "Doctos retrieved successfully.", docs, res) })
      .catch(err => { console.log('err', err) });
  } catch (error) {
    console.log('error--->', error);
  }
}

// //============================= Get All Doctor ==========================//
exports.getAllDoctorsDetails = async (req, res) => {
  try {

    const { page = 1, limit = 10, search = '' } = req.query;

    const doctors = await doctorsModel.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { first_name: { $regex: search, $options: 'i' } },
        { middle_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
      ]
    })
      .select("-password  -__v -account_type -otp")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ created_at: -1 })
      .exec();

    return successResponse(200, "Doctos retrieved successfully.", doctors, res)


  } catch (error) {
    console.log('error--->', error);
    res.status(500).json({ message: error.message })
  }
}

//============================= Get Doctor By Id==========================//
exports.getDoctorById = async (req, res) => {
  try {
    let docId = req.params.id;
    await doctorsModel.aggregate([
      {
        $match:
          { _id: mongoose.Types.ObjectId(docId) }
      },
      {
        $lookup: {
          from: "certificate_files",
          let: { doc: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$docId", "$$doc"] } } },
            { $project: { url: 1, fileType: 1 } }
          ],
          as: "certificates"
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]).then(docs => {
      successResponse(200, "Doctos retrieved successfully.", docs[0], res)
    }).catch(err => { console.log('err', err) });
  } catch (error) {
    console.log('error--->', error);
  }
}

//============================= Update Doctor ==========================//
exports.updatedoctor = async (req, res) => {
  try {
    let user = req.userData; body = req.body; updatedData = {};
    let docId = user.account_type === "ADMIN" ? body.doctorId : user._id;
    if (body.email && body.email != "") {
      await doctorsModel.findOne({ email: body.email }).select("_id").then((doc) => {
        if (doc != null) {
          if (doc._id.toString() === body.doctorId.toString()) {
            updatedData.email = body.email;
          } else {
            errorResponse(422, "Email is already associated with an account.", res);
          }
        } else { updatedData.email = body.email; }
      });
    }
    console.log('updatedData--->', updatedData);

    if (body.contact_number && body.contact_number != "") {
      await doctorsModel.findOne({ contact_number: body.contact_number }).select("_id").then((doc) => {
        if (doc != null) {
          if (doc._id.toString() === body.doctorId.toString()) {
            updatedData.contact_number = body.contact_number;
          } else {
            errorResponse(422, "Contact number is already associated with an account.", res);
          }
        } else { updatedData.contact_number = body.contact_number }
      });
    }
    updatedData.title = body.middle_name ? `Dr. ${body.first_name} ${body.middle_name} ${body.last_name}` : `Dr. ${body.first_name} ${body.last_name}`,
      updatedData.first_name = body.first_name ? body.first_name : "";
    updatedData.last_name = body.last_name ? body.last_name : "";
    updatedData.middle_name = body.middle_name ? body.middle_name : "";
    updatedData.qualification = body.qualification ? body.qualification : "";
    updatedData.speciality = body.speciality ? body.speciality : "";
    updatedData.reg_number = body.reg_number ? body.reg_number : "";
    updatedData.dob = body.dob ? body.dob : "";
    updatedData.address = body.address ? body.address : "";
    updatedData.home_address = body.home_address ? body.home_address : "";
    updatedData.blood_group = body.blood_group ? body.blood_group : "";
    updatedData.life_time_membership_number = body?.life_time_membership_number ? body?.life_time_membership_number : "";
    if (body.image && user.account_type != "ADMIN" && user.body.image != user?.image) {
      existedImageremove(user.image);
      updatedData.image = body.image ? body.image : user?.image;
    }
    await doctorsModel.findByIdAndUpdate({ _id: docId }, { $set: updatedData }).then(async (docs) => {
      successResponse(200, "Doctor has been updated successfully.", {}, res);
    }).catch((err) => {
      errorResponse(422, err.message, res)
    })
  }
  catch (err) {
    console.log('error--->', err);
  }
}

//============================= Remove Doctor ==========================//
exports.removedocotraccount = async (req, res) => {
  try {
    let authUser = req.userData; docId = req.params.id;
    if (authUser.account_type === "ADMIN") {
      await doctorsModel.deleteOne({ _id: docId }).then((docs) => {
        successResponse(200, "Doctors account has been removed successfully", {}, res)
      }).catch((err) => {
        errorResponse(422, err.message, res);
      })
    } else {
      errorResponse(401, "Unauthorized user", res);
    }
  } catch (err) {
    errorResponse(500, err.message, res);
  }
}

//============================= Approve Doctor==========================//
exports.approvedoctor = async (req, res) => {
  let user = req.userData;
  try {
    if (user.account_type == "ADMIN") {
      let body = req.body; let updatedData = {};
      if (body.isApproved) {
        updatedData.isApproved = body.isApproved
      }
      await doctorsModel.findByIdAndUpdate({ _id: body.doctorId }, { $set: updatedData }).then(docs => { successResponse(200, "Status updated successfully", {}, res) })

      const doctor = await doctorsModel.findOne({ _id: body?.doctorId }).select("_id email first_name last_name");

      // send mail to doctor
      emailNotify(doctor, "APPROVE_DOCTOR")

    } else {
      errorResponse(401, "Authentication failed", res);
    }
  } catch (err) { console.log('error', err) }

}

//============================= Forget Password =============================//
exports.forgetPassword = async (req, res,) => { }

//============================= OTP Match =============================//
exports.verifyOtpMatch = async (req, res) => { }

//============================= Import Excel ==========================//
exports.importexcel = async (req, res) => {
  console.log('importexcel api called..');
  let workbook = XLSX.readFile("./BMB_user_list.xlsx");
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  for (let i = 2; i <= 540; i++) {
    let counts = await doctorsModel.find({}).sort({ created_at: -1 });
    const object = {};
    let name = worksheet[`B${i}`].v.split(" ");
    object.title = `Dr. ${worksheet[`B${i}`].v}`
    object.first_name = name[0];
    object.middle_name = name.length > 2 ? name[1] : "";
    object.last_name = name.length > 2 ? name[2] : name[1];
    object.qualification = worksheet[`C${i}`].v;
    object.email = !worksheet[`H${i}`] ? `xyz${i}@gmail.com` : worksheet[`H${i}`].v.toLowerCase();
    object.contact_number = !worksheet[`G${i}`] ? "" : worksheet[`G${i}`].v;
    object.password = bcrypt.hashSync(`BMB2023`, saltRounds);
    object.home_address = !worksheet[`I${i}`] ? "" : worksheet[`I${i}`].v;
    object.clinic_address = !worksheet[`J${i}`] ? "" : worksheet[`J${i}`].v;
    // object.addOfComunication = worksheet[`J${i}`] != "" ? worksheet[`J${i}`].v : "";
    object.blood_group = "O+";
    object.dob = "01/01/2000";
    object.reg_number = 000000;
    object.isApproved = "APPROVED";
    object.speciality = worksheet[`D${i}`] != "" ? worksheet[`D${i}`].v : "";
    object.docId = counts.length > 0 ? `BMBDR${generateId(counts[0].docId)}` : 'BMBDR0001';
    object.account_type = "USER";
    object.state = worksheet[`K${i}`] != "" ? worksheet[`K${i}`].v : "";
    let dataExist = await doctorsModel.countDocuments({ $or: [{ email: object.email }, { contact_number: object.contact_number }] })
    if (dataExist === 0) {
      await doctorsModel(object).save().then((docs) => { console.log('docs', docs.title, docs.docId) })
        .catch((err) => console.log('error', err))
    } else {
      console.log('dulicate data--->', object.title, object.email, object.contact_number);
    }
  }
  successResponse(200, "Doctors imported successfully", {}, res);
}

//============================= Post Upload ==========================//
exports.postUpload = async (req, res) => {
  try {
    let user = req.userData;
    if (user.account_type === "DOCTOR") {
      let obj = {
        ...req.body,
        isActive: true,
        user: user._id
      }
      await new userPostsModel(obj).save().then((docs) => {
        successResponse(201, "Post Upload Successfully", docs, res);
      }).catch(err => { errorResponse(422, err.message, res) });
    } else {
      errorResponse(401, "Unauthorized user", res);
    }
  } catch (err) {
    errorResponse(500, err.message, res);
  }
}

//=============================  Post by doctor Id ==========================//
exports.getdoctorsPosts = async (req, res) => {
  try {
    let user = req.userData;
    if (user.account_type === "DOCTOR") {
      await userPostsModel.find({ user: user._id, isActive: true }).then((docs) => {
        successResponse(201, "Post Upload Successfully", docs, res);
      }).catch(err => { errorResponse(422, err.message, res) });
    } else {
      errorResponse(401, "Unauthorized user", res);
    }
  } catch (err) {
    errorResponse(500, err.message, res);
  }
}

//==================== Device Token =================
exports.device_token = async (req, res) => {
  try {
    let authUser = req.userData; let body = req.body; update = {};
    if (authUser.account_type === "DOCTOR") {
      if (body.type.toUpperCase() === "WEB") { update.web_token = body.token }
      if (body.type.toUpperCase() === "APP") { update.app_token = body.token }
      await doctorsModel.findByIdAndUpdate({ _id: authUser._id }, { $set: update })
        .then((docs) => successResponse(200, "Token has been saved", {}, res))
        .catch((err) => errorResponse(422, err.message, res))
    }
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

//=================== check_first_time_login =================
exports.check_first_time_login = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return errorResponse(422, "Please provide email", res)
    }

    const doctor = await doctorsModel.findOne({ email }).select("_id is_first_time_login");

    if (!doctor) {
      return errorResponse(404, "Doctor not found", res)
    }

    return successResponse(200, "First time login", { is_first_time_login:  doctor?.is_first_time_login }, res)

  } catch (err) {
    errorResponse(500, err.message, res)
  }
}


