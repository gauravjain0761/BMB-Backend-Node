var jwt = require('jsonwebtoken');
const secret = process.env.JWT_SCERT;
const { errorResponse } = require('../helpers/response');
const doctorsModel = require('../models/doctors.model');
const adminModel = require("../models/admin.model");
exports.generateWebToken = (docId) => {
  return jwt.sign({
    data: docId,
  }, secret);
  // return jwt.sign({
  //   data: docId,
  // }, secret, { expiresIn: 60 * 60 * 24 * 7 });
}

exports.verifyWebToken = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        errorResponse(401, "Authentication failed", res)
      } else {
        await doctorsModel.findOne({ _id: decoded.data }).then(async (docs) => {
          if (docs) {
            req['userData'] = docs;
            next();
          } else {
            await adminModel.findOne({ _id: decoded.data }).then((admin) => {
              req['userData'] = admin;
              next();
            }).catch((err) => {
              console.log('auth token error', err);
            })
          }
        }).catch((err) => { console.log('auth token error', err); })
      }
    })
  } else {
    errorResponse(401, "Authentication failed", res)
  }
}