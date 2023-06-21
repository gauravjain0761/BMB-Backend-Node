const cronJob = require('node-cron');
const eventsModel = require('../models/events.model');
const { sendNotification } = require('./pushNotify');


exports.eventReminder = async () => {

    // cron job running every day at 12:00 AM
    cronJob.schedule('0 0 * * *', async () => {

        // get all events check if event date is not expired
        let events = await eventsModel.find({ isActive: true, date: { $gte: new Date() } });

        // if events found then send notification
        if (events?.length > 0) {

            let newDate = new Date(events[0]?.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            }).replace(/ /g, ' ');

            const message = {
                title: "New Event",
                body: ` Please register for the upcoming bmb meeting on ${newDate}. You can
                register from the mobile app directly.`,
                sound: "default",
                type: "event",
            };

            sendNotification(message);
        }

    });

}
