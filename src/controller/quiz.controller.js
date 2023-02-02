const mongoose = require('mongoose');
const QuizModel = require('../models/quiz.model');
const { successResponse, errorResponse } = require('../helpers/response');

//============================= Create Quiz ==========================//
exports.createQuiz = async(req, res)=>{
    try{
        let authUser = req.userData;
    if(authUser.account_type === 'ADMIN'){
        let body = req.body;
              await new QuizModel({url: body.url}).save().then((docs)=>{
                successResponse(201, "quiz created successfully", docs, res);
              }).catch((err)=>{
                errorResponse(422, err.message, res);
              })
        }else {
          errorResponse(401, "Unauthurized User", res);
    }
    }catch(err){
        errorResponse(500, err.messge, res);
    }
}