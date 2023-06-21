const mongoose = require('mongoose');
const pushnotifyModel = require('../models/pushnotify.model');
const doctorModel = require('../models/doctors.model');
const { successResponse, errorResponse } = require('../helpers/response');
const { sendCloudNotification } = require('../helpers/pushNotify');
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgF306E9anZw5nLFpBQmegGJ1AyVNs5FI",
  authDomain: "mohit-a7732.firebaseapp.com",
  projectId: "mohit-a7732",
  storageBucket: "mohit-a7732.appspot.com",
  messagingSenderId: "311888618581",
  appId: "1:311888618581:web:f7ca764abc65727caa20dc",
  measurementId: "G-3GKF1W9Q57"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

exports.createNotification = async (req, res) => {
    try {
        const user = req.userData;
        
        if (user.account_type !== "ADMIN") {
            return errorResponse(401, "Authentication failed", res);
        }

        const { content, title, date, link } = req.body;
        const updateData = {
            title: title,
            content: content,
            date: date,
            ...(link && { link: link })
        };

        const newNotification = await pushnotifyModel.create(updateData);
        successResponse(201, "Notification saved successfully", newNotification, res);

        // Send push notification to all approved doctors
        const doctors = await doctorModel.find({ isApproved: "APPROVED", fcmToken : {
            $ne: ''
        } }).lean();

    
        if (doctors.length > 0) {
            for (let ele of doctors) {
                    if(ele?.fcmToken){
                        const message = {
                            title: title,
                            body: content,
                            sound: "default",
                            date: String(new Date()),
                            ...(link && { click_action: link }),
                            type : "customMessage"
                        };

                        sendCloudNotification(ele.fcmToken, message);
                    }
            }
        }
    
        
    } catch (error) {
        console.log('error creating notification', error);
        errorResponse(500, "Internal Server Error", res);
    }
};


exports.getAll = async (req, res) => {
    let user = req.userData;
    try {
        if (user.account_type == "ADMIN") {
            await pushnotifyModel.find({}).sort({ created_at: -1 }).then((docs) => {
                // successResponse(200, "Notification Retrieved successfully", docs, res);

            }).catch(err => errorResponse(422, err.message, res))
        } else {
            errorResponse(401, "Authentication failed", res);
        }
    } catch (error) {
        console.log('error creating notification', error);
    }
}

// const sendPushNotify = async (data) => {
//     // console.log('data', data);
//     let doctors = await doctorModel.find({});
//     for (let ele of doctors) {
//         if(ele.device_token != ''){
//             let payload = {
//                 to: ele["_doc"].device_token,
//                 notification: {
//                     body: "Firebase Cloud Message Body",
//                     title: "Firebase Cloud Message Title",
//                     sound: "default",
//                     subtitle: "Firebase Cloud Message Subtitle"
//                 }
//             }
//             let docToken = "dGkGMOlzTcCbwHKChqDnuX:APA91bEITu0S7IPKsXKIA4WU7HU_r7zhi56QTmYRac2uzhIkZ0H1XH8tUKv3VYfdze6c33dbe3CVnE3QbvMkiftkKi6bI0zpIYsWbRLsJZi6Wpa9ybgusTylR8Wt8aQi8pxMl96YvTT4"
//             console.log('body',docToken, body);
//              analytics
//             .messaging()
//             .sendToDevice(docToken, payload)
//             .then((response) => {
//               console.log(
//                 "notificaiton sent " +
//                 response.canonicalRegistrationTokenCount,
//                 response.successCount,
//                 response.results
//               );
//             });
//         }
       
//     }

// }