const nodemailer = require('nodemailer');
const ejs = require('ejs');

const hash = require('./hash').hash;
const db = require('./db');

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

const SENDER_EMAIL = 'freegamesnewsletter@gmail.com';
const SENDER_PASSWORD = process.env.FREEGAMESNEWSLETTER_PASSWORD;

const SUBJECT = 'Confirm your subscription';

async function sendConfirmationEmail(email) {
    let subscriberWithThisEmail = await db.findSubscriber(email);
    if (subscriberWithThisEmail) {
        return console.log(email + ' already subscribed! Ignoring...');
    }

    console.log('Sending confirmation email to:' + email);

    let transporter = createTransport();
    transporter.verify(function(error, success) {
        if (error) {
            return console.log(error);
        }

        console.log('Ready to send messages via SMTP');
            
        generateHTMLmessage(email)
            .then((html) => {
                transporter.sendMail({
                    from: SENDER_EMAIL,
                    to: email,
                    subject: SUBJECT,
                    html: html,
                }, (err, info) => {
                    console.log('Confirmation email sent to %s: %s', email, info);
                });
            });
    });
};

function createTransport() {
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: true,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD,
        },
    });
};

async function generateHTMLmessage(email) {
    const confirmUrl = 'https://www.freegamesnewsletter.tech/confirmEmail?email=' + email + '&code=' + hash(email);

    return await ejs.renderFile('src/email_templates/confirmation.html', {confirmUrl}, {async: true});
};

module.exports = {sendConfirmationEmail};