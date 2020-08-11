const ejs = require('ejs');

const hash = require('../utils/hashUtils').hash;
const broker = require('./broker');

const SITE_URL = process.env.SITE_URL;
const SUBJECT = 'Confirm your subscription';

const Subscribers = require('../models/subscribers');

async function sendConfirmationEmail(email) {
    const subscriberExists = await Subscribers.exists({ email: email });
    if (subscriberExists) {
        return console.log(email, 'already subscribed! Ignoring...');
    }

    console.log('Sending confirmation email to:', email);
    generateHTMLmessage(email).then((html) => {
        msg = {
            email: email,
            subject: SUBJECT,
            html: html,
        };

        broker.publish('', 'emails', JSON.stringify(msg));
    });
}

async function generateHTMLmessage(email) {
    const confirmUrl =
        SITE_URL + '/confirmEmail?email=' + email + '&code=' + hash(email);

    return await ejs.renderFile(
        'src/email_templates/confirmation.html',
        { confirmUrl },
        { async: true }
    );
}

module.exports = { sendConfirmationEmail };
