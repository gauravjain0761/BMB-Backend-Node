const { errorResponse } = require('../helpers/response');
const doctorsModel = require('../models/doctors.model');
exports.verifyEmail = (req, res, next) => {
  let { email, contact_number } = req.body;
  if (email.match("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")) {
    if (contact_number.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
      next()
    } else {
      errorResponse(406, "Contact Number is not valid.", res);
    }
  } else {
    errorResponse(406, "Email is not valid.", res);
  }
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

exports.verifydmin = (req,res,next) => {
  let {email} = req.body; 
  if (email.match("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")) {
    next();
  }else{
    errorResponse(406, "Email is not valid.", res);
  }
}
