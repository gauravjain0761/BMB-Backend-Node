const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const saltRounds = process.env.SALT;
const AdminModel = require('../../models/admin.model');
const { successResponse, errorResponse } = require('../../helpers/response');
const { generateWebToken, } = require('../../helpers/jwt');

//============================= Admin Register ==========================//
exports.createAdmin = async (req, res, next) => {
    try {
        let Object = {
            name: "Admin",
            email: "admin@bmb.com",
            password: bcrypt.hashSync("bmb@123", saltRounds),
            account_type: "ADMIN"
        }
        await new AdminModel(Object).save().then(docs => [
            successResponse(201, "Admin created successfully", docs, res),
        ]).catch(err => { console.log('err---->', err) });
    } catch (error) {
        console.log('error creating admin', error);
    }
}

//============================= Admin Login ==========================//
exports.adminlogin = async (req, res) => {
    try {
        let { email, password } = req.body;
        await AdminModel.findOne({ email: email }).then((docs) => {
            if (!docs) {
                errorResponse(422, "Account does not exists.", res);
            } else {
                if (bcrypt.compareSync(password, docs["_doc"].password) === true) {
                    docs['_doc'].auth_token = `Bearer ${generateWebToken(docs._id)}`
                    successResponse(200, "Login successfully.", docs, res);
                } else {
                    errorResponse(422, "Password does not matched.", res)
                }
            }
        })
    } catch (error) {
        console.log('errorResponse', error);
    }

}