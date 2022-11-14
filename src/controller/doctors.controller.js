const mongoose = require('mongoose');
const doctorsModel = require('../models/doctors.model')
var bcrypt = require('bcryptjs');
const saltRounds = 10;
const moment = require('moment');
const XLSX = require('xlsx');
const { success, errorResponse } = require('../helpers/response');
const { generateWebToken, } = require('../helpers/jwt');

//============================= Doctor Register==========================//
exports.register = async (req, res) => {
  try {
    let { first_name, middle_name, last_name, email, password, contact_number, qualification, speciality, reg_number, dob, blood_group } = req.body;
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
      blood_group: blood_group
    }
    if (password != null && password != '') {
      object.password = bcrypt.hashSync(password, saltRounds);
      let counts = await doctorsModel.countDocuments();
      let last = await doctorsModel.findOne({}).sort({ _id: -1 }).limit(1).select("docId");
      object.docId = counts === 0 ? 'BMBDR1000' : `BMBDR${parseInt(last.docId.split('R')[1]) + 1}`;
      await new doctorsModel(object).save().then(async (docs) => {
        docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
        success(201, "Doctor has been registered successfully.", docs, res);
      }).catch(err => {
        errorResponse(422, err.message, res)
      })
    }
  } catch (err) {
    console.log("error---->", err);
  }
}

exports.doctorlogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    await doctorsModel.findOne({ $or: [{ email: email }, { contact_number: email }] }).then((docs) => {
      if (!docs) {
        errorResponse(404, "Account does not exists.", res);
      } else {
        if (!docs.isApproved) {
          errorResponse(422, "Your Account is not verified. Please contact to admin", res)
        } else {
          if (bcrypt.compareSync(password, docs["_doc"].password) === true) {
            docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
            success(201, "Login successfully.", docs, res);
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

exports.updatedoctor = async (req, res) => {
  try {
    console.log('req', req.params.id);
  }
  catch (err) {
    console.log('error--->', err);
  }
}


exports.importexcel = async (req, res) => {
  console.log('importexcel api called..');
  let workbook = XLSX.readFile("./Docspreadsheet.xlsx");
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];
  var docdata = [];
  for (let i = 2; i < 375; i++) {
    const object = {};
    let name = worksheet[`B${i}`].v.split(" ");
    object.title = `Dr. ${worksheet[`B${i}`].v}`
    object.first_name = name[0];
    object.middle_name = name.length > 2 ? name[1] : "";
    object.last_name = name.length > 2 ? name[2] : name[1];
    object.qualification = worksheet[`C${i}`].v;
    object.email = !worksheet[`G${i}`] ? "" : worksheet[`G${i}`].v;
    object.contact_number = !worksheet[`F${i}`] ? "" : worksheet[`F${i}`].v;
    object.password = bcrypt.hashSync(`BMB2022`, saltRounds);
    object.home_address = !worksheet[`H${i}`] ? "" : worksheet[`H${i}`].v;
    object.clinic_address = !worksheet[`I${i}`] ? "" : worksheet[`I${i}`].v;
    object.addOfComunication = worksheet[`J${i}`] != "" ?worksheet[`J${i}`].v : "";
    object.blood_group = "O+";
    object.dob = "01/01/2000";
    object.reg_number = 000000;
    object.isApproved = false;
    object.speciality = "xyz";
    object.docId = `BMBDR${1000 + i-1}`;
    docdata.push(object);
  }
  console.log('docdata------>', docdata);
  await doctorsModel.insertMany(docdata).then((docs) => { success(201, "Doctors created successfully.", res)
  }).catch((err) => console.log('error', err));
}

