
var admin = require("firebase-admin");
var serviceAccount = require("../config/bmb-project-381908-firebase-adminsdk-7097f-d48cf3e8a5.json");
const topicName = 'industry-tech';
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
exports.sendCloudNotification = async (token, msg) => {
    const payload = {
        notification: {
            title: msg.title,
            body: msg.body,
            sound: "default",
            date: String(new Date()),
        },
        data: {
            title: msg.title,
            //   subtitle: data.remailcontent,
            type: msg.title,
        },
    };

    admin.messaging().sendToDevice(token, payload)
        .then((response) => {
            console.log('successfull...', response);
        })
        .catch((error) => {
            console.log('error...', error);
        })

}
