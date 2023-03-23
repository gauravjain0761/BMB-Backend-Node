const nodemailer = require('nodemailer');
const senderAddress = process.env.NODEMAILER_EMAIL;
const seceret = process.env.NODEMAILER_SECERET;
var transport = nodemailer.createTransport({
    host: "az1-ss104.a2hosting.com",
    port: 587,
    service: "Gmail",
    secureConnection: true,
    auth: {
        user: senderAddress,
        pass: seceret
    }
});

exports.emailNotify = async (data, type) => {
    try {
        // console.log(data, type);
        let payload = {
            from: `"BMB " <${senderAddress}>`,
        }
        switch (type.toUpperCase()) {
            case "FORGET_PASSWORD":
                payload.to = `${data.email}`;
                payload.subject = "Reset Password OTP ✔";
                // payload.text = "";
                payload.html = `<p><strong>Hello ${data.first_name}, </strong></p><p>Greetings of the day Hope you are doing well.</p><p>Here is the one-time password for your BMB account: ${data.otp}.</p><p><br></p><p>For privacy concerns, please do not share it with any other individuals.</p><p><br></p><p>Thanks &amp; Regards,</p><p>BMB</p>`;
                break;

            default:
                break;
        }
        // console.log('payload', payload);

        transport.sendMail(payload, (error, body) => {
            if (error) console.log('sendMail error---->', error);
            if (body) {
                console.log('body', body);
            }
        });
    } catch (error) {
        console.log('error in mail send', error);
    }
}