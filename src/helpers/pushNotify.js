const admin = require("firebase-admin");
const serviceAccount = require("../config/bmb-project-381908-firebase-adminsdk-7097f-d48cf3e8a5.json");

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
                type: 'message'
            },
        };
        const response = await admin.messaging().sendToDevice(token, payload);
        console.log('Successfully sent notification:',response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};
