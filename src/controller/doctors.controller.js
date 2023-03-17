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
    let { first_name, middle_name, last_name, email, password, contact_number, qualification, marriage_date, speciality, reg_number, dob, blood_group, degree_certificate, mmc_certificate, image, state } = req.body;
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
        state: state,
        marriage_date: marriage_date,
        degree_certificate: degree_certificate ? degree_certificate : "",
        mmc_certificate: mmc_certificate ? mmc_certificate : ""
      }
      if (password != null && password != '') {
        object.password = bcrypt.hashSync(password, saltRounds);
        let counts = await doctorsModel.find({}).sort({ "created_at": -1 });
        let last = await doctorsModel.findOne({}).sort({ _id: -1 }).limit(1).select("docId");

        object.docId = counts.length > 0 ? `BMBDR${generateId(counts[0].docId)}` : 'BMBDR0001';
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

//============================= Doctor Login ==========================//
exports.doctorlogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    await doctorsModel.findOne({ $or: [{ email: email }, { contact_number: email }] }).then((docs) => {
      if (!docs) {
        errorResponse(422, "Account does not exists.", res);
      } else {
        if (!docs.isApproved) {
          errorResponse(422, "Your Account is not verified. Please contact to admin", res)
        } else {
          if (bcrypt.compareSync(password, docs["_doc"].password) === true) {
            docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
            delete docs["_doc"].otp;
            delete docs["_doc"].password
            successResponse(200, "Login successfully.", docs, res);
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
    await doctorsModel.findOne({ contact_number: req.body.contact_number }).then(async (doc) => {
      if (!doc) {
        errorResponse(422, "The Number is not registerd.", res)
      } else {
        let otp = 1234;
        await doctorsModel.findByIdAndUpdate({ _id: doc['_doc']._id }, { $set: { otp: otp } }).then((result) => {
          successResponse(200, "An OTP hase been sent  your registered mobile number.", {}, res)
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
    console.log('req.body---->', req.body);
    let { contact_number, otp } = req.body;
    await doctorsModel.findOne({ contact_number: req.body.contact_number }).then(async (doc) => {
      if (!doc) {
        errorResponse(422, "The Number is not registerd.", res)
      } else {
        if (parseInt(doc.otp) === parseInt(otp)) {
          doc['_doc'].auth_token = `Bearer ${generateWebToken(doc["_doc"]._id)}`;
          delete doc["_doc"].otp;
          delete doc["_doc"].password;
          successResponse(200, "Login successfully.", doc, res);
        }
        else { errorResponse(406, "Invalid OTP!", res) }
      }
    }).catch((err) => { errorResponse(422, err.message, res) })
  } catch (err) {
    errorResponse(500, err.message, res)
  }
}

//============================= Get All Doctor ==========================//
exports.getAllDoctors = async (req, res) => {
  try {
    let filter = {}
    if (req.type && req.type === "USER") {
      filter.isApproved = "APPROVED"
    }
    await doctorsModel.find(filter).sort({ _id: -1 })
      .select("-password -created_at -updated_at -__v -account_type -blood_group")
      .then(docs => { successResponse(200, "Doctos retrieved successfully.", docs, res) })
      .catch(err => { console.log('err', err) });
  } catch (error) {
    console.log('error--->', error);
  }
}

//============================= Get Doctor By Id==========================//
exports.getDoctorById = async (req, res) => {
  try {
    let docId = req.params.id;
    await doctorsModel.findOne({ _id: docId }).select("-password").then(docs => {
      successResponse(200, "Doctos retrieved successfully.", docs, res)
    }).catch(err => { console.log('err', err) });
  } catch (error) {
    console.log('error--->', error);
  }
}

//============================= Update Doctor ==========================//
exports.updatedoctor = async (req, res) => {
  try {
    let user = req.userData;
    let updatedData = {};
    let body = req.body;
    if (body.email && body.email != "") {
      await doctorsModel.findOne({ email: body.email }).select("_id").then((doc) => {
        if (doc != null) {
          if (doc._id.toString() === user._id.toString()) {
            updatedData.email = body.email;
          } else {
            errorResponse(422, "Email is already associated with an account.", res);
          }
        }
      });
    }
    if (body.contact_number && body.contact_number != "") {
      await doctorsModel.findOne({ contact_number: body.contact_number }).select("_id").then((doc) => {
        if (doc != null) {
          if (doc._id.toString() === user._id.toString()) {
            updatedData.contact_number = body.contact_number;
          } else {
            errorResponse(422, "Contact number is already associated with an account.", res);
          }
        }
      });
    }
    updatedData.title = body.middle_name ? `Dr. ${body.first_name} ${body.middle_name} ${body.last_name}` : `Dr. ${body.first_name} ${body.last_name}`,
      updatedData.first_name = body.first_name ? body.first_name : user?.first_name;
    updatedData.last_name = body.last_name ? body.last_name : user?.last_name;
    updatedData.middle_name = body.middle_name ? body.middle_name : user?.middle_name;
    updatedData.qualification = body.qualification ? body.qualification : user?.qualification;
    updatedData.speciality = body.speciality ? body.speciality : user?.speciality;
    updatedData.reg_number = body.reg_number ? body.reg_number : user?.reg_number;
    updatedData.dob = body.dob ? body.dob : user?.dob;
    updatedData.blood_group = body.blood_group ? body.blood_group : user?.blood_group;
    if (body.image && body.image != user?.image) {
      existedImageremove(user.image);
      updatedData.image = body.image ? body.image : user?.image;
    }
    await doctorsModel.findOneAndUpdate({ _id: user._id }, { $set: updatedData }).then(async (docs) => {
      await doctorsModel.findOne({ _id: user._id }).select("first_name middle_name last_name").then(async (docs) => {
        title = docs.middle_name !== "" ? `Dr. ${docs.first_name} ${docs.middle_name} ${docs.last_name}` : `Dr. ${docs.first_name} ${docs.last_name}`
        await doctorsModel.findOneAndUpdate({ _id: user._id }, { $set: { title: title } }).then(async (docs) => {
          successResponse(200, "Doctor has been updated successfully.", {}, res);
        })
      })
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
      if (body.email && body.email != "") {
        await doctorsModel.findOne({ email: body.email }).select("_id").then((doc) => {
          if (doc != null) {
            if (doc._id.toString() === body.doctorId.toString()) {
              updatedData.email = body.email;
            } else {
              errorResponse(422, "Email is already associated with an account.", res);
            }
          }
        });
      }
      if (body.contact_number && body.contact_number != "") {
        await doctorsModel.findOne({ contact_number: body.contact_number }).select("_id").then((doc) => {
          if (doc != null) {
            if (doc._id.toString() === body.doctorId.toString()) {
              updatedData.contact_number = body.contact_number;
            } else {
              errorResponse(422, "Contact number is already associated with an account.", res);
            }
          }
        });
      }
      updatedData.title = body.middle_name ? `Dr. ${body.first_name} ${body.middle_name} ${body.last_name}` : `Dr. ${body.first_name} ${body.last_name}`,
        updatedData.first_name = body.first_name;
      updatedData.last_name = body.last_name;
      updatedData.middle_name = body.middle_name;
      updatedData.qualification = body.qualification;
      updatedData.speciality = body.speciality;
      updatedData.reg_number = body.reg_number;
      updatedData.dob = body.dob;
      updatedData.marriage_date = body.marriage_date;
      updatedData.state = body.state;
      updatedData.blood_group = body.blood_group;
      updatedData.isApproved = body.isApproved.toUpperCase()
      if (body.image && body.image != user?.image) {
        existedImageremove(user.image);
        updatedData.image = body.image ? body.image : user?.image;
      }
      await doctorsModel.findByIdAndUpdate({ _id: body.doctorId }, { $set: updatedData }).then(docs => { successResponse(200, "Status updated successfully", {}, res) })
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
  let workbook = XLSX.readFile("./doctorspreadsheet_copy.xlsx");
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  for (let i = 2; i < 371; i++) {
    let counts = await doctorsModel.find({}).sort({ "created_at": -1 });
    const object = {};
    let name = worksheet[`B${i}`].v.split(" ");
    object.title = `Dr. ${worksheet[`B${i}`].v}`
    object.first_name = name[0];
    object.middle_name = name.length > 2 ? name[1] : "";
    object.last_name = name.length > 2 ? name[2] : name[1];
    object.qualification = worksheet[`C${i}`].v;
    object.email = !worksheet[`G${i}`] ? `xyz${i}@gmail.com` : worksheet[`G${i}`].v;
    object.contact_number = !worksheet[`F${i}`] ? "" : worksheet[`F${i}`].v;
    object.password = bcrypt.hashSync(`BMB2022`, saltRounds);
    object.home_address = !worksheet[`H${i}`] ? "" : worksheet[`H${i}`].v;
    object.clinic_address = !worksheet[`I${i}`] ? "" : worksheet[`I${i}`].v;
    object.addOfComunication = worksheet[`J${i}`] != "" ? worksheet[`J${i}`].v : "";
    object.blood_group = "O+";
    object.dob = "01/01/2000";
    object.reg_number = 000000;
    object.isApproved = "APPROVED";
    object.speciality = "xyz";
    object.docId = counts.length > 0 ? `BMBDR${generateId(counts[0].docId)}` : 'BMBDR0001';
    object.account_type = "USER";
    await doctorsModel(object).save().then((docs) => { console.log('docs', docs) })
      .catch((err) => console.log('error', err))
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
