const admin = require("firebase-admin");
const serviceAccount = require("../config/bmb-project-381908-firebase-adminsdk-7097f-d48cf3e8a5.json");
const doctorsModel = require("../models/doctors.model");

const topicName = 'industry-tech';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

exports.sendCloudNotification = async (token, msg) => {
    try {
        const payload = {
            notification: {
                title: msg.title,
                body: msg.body,
                sound: "default",
                date: String(new Date()),
            },
            data: {
                title: msg.title,
                type: msg?.type || 'message',
                ...(msg?.click_action && { click_action: msg.click_action })
            },
        };
        const response = await admin.messaging().sendToDevice(token, payload);
        console.log('Successfully sent notification:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

exports.sendNotification = async (msg) => {
    try {

        const doctors = await doctorsModel.find({
            isApproved: "APPROVED", fcmToken: {
                $ne: ''
            }
        }).lean();

        if (doctors.length > 0) {
            for (let ele of doctors) {
                if (ele?.fcmToken) {
                    const message = {
                        ...msg,
                        sound: "default",
                        date: String(new Date()),
                    };

                    this.sendCloudNotification(ele.fcmToken, message);
                }
            }
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}
