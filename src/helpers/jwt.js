var jwt = require('jsonwebtoken');
const secret = process.env.JWT_SCERT;
const { errorResponse } = require('../helpers/response');
const doctorsModel = require('../models/doctors.model');
exports.generateWebToken = (docId) => {
  return jwt.sign({
    data: docId,
  }, secret, { expiresIn: 60 * 60 * 24 * 7 });
}

exports.verifyWebToken = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        errorResponse(401, "Authentication failed", res)
      } else {
        // console.log(decoded);
        await doctorsModel.findOne({ _id: decoded.data }).then((docs) => {
          req['userdata'] = docs;
          next();
        }).catch((err) => { console.log('auth token error', err); })
      }
    })
  } else {
    errorResponse(401, "Authentication failed", res)
  }
}