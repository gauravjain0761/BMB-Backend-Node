const mongoose = require('mongoose');
const QuizModel = require('../models/quiz.model');
const { successResponse, errorResponse } = require('../helpers/response');
const { sendNotification } = require('../helpers/pushNotify');

//============================= Create Quiz ==========================//
exports.createQuiz = async (req, res) => {
  try {
    let authUser = req.userData;
    if (authUser.account_type === 'ADMIN') {
      let body = req.body;
      await new QuizModel({ url: body.url }).save().then((docs) => {
        successResponse(201, "quiz created successfully", docs, res);

        // send notification
          const message = {
            title: "New Quiz",
            body: `Hey Tab to start QUIZ Now!`,
            sound: "default",
            click_action : body?.url
          };

          sendNotification(message);

      }).catch((err) => {
        errorResponse(422, err.message, res);
      })
    } else {
      errorResponse(401, "Unauthurized User", res);
    }
  } catch (err) {
    errorResponse(500, err.messge, res);
  }
}

//============================= Get Quiz ==========================//
exports.getQuiz = async (req, res) => {
  try {
    await QuizModel.findOne().sort(
      { created_at: -1 }
    ).then((docs) => {
      successResponse(200, "quiz retrieved successfully", docs, res);
    }).catch((err) => {
      errorResponse(422, err.message, res);
    })
  } catch (err) {
    errorResponse(500, err.messge, res);
  }
}