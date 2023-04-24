const ObjectId = require('mongoose').Types.ObjectId;
const { errorResponse } = require('../helpers/response');
const doctorsModel = require('../models/doctors.model');
exports.verifyEmail = (req, res, next) => {
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)
    ? errorResponse(406, "Invalid email!", res)
    : next();
}
exports.verifyPhone = (req, res, next) => {
  !/^(\+\d{1,3}[- ]?)?\d{10}$/.test(parseInt(req.body.contact_number))
    ? errorResponse(406, "Invalid phone number!", res)
    : next();
}

exports.verifyDocAccount = async (req, res, next) => {
  let { email, contact_number } = req.body;
  let emailDocs = await doctorsModel.countDocuments({ email: email });
  let numDocs = await doctorsModel.countDocuments({ contact_number: contact_number })
  if (emailDocs > 0) {
    errorResponse(422, "Email is already associated with an account.", res);
  } else if (numDocs > 0) {
    errorResponse(422, "Contact number is already associated with an account.", res);
  } else {
    next()
  }
}

exports.verifydmin = (req, res, next) => {
  let { email } = req.body;
  if (email.match("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")) {
    next();
  } else {
    errorResponse(406, "Email is not valid.", res);
  }
}

exports.isValidObjectId = (id) => {
    if (ObjectId.isValid(id)) {
      if ((String)(new ObjectId(id)) === id)
        return true;
      return false;
    }
    return false;
}
  