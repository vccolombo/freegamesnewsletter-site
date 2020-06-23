const nodemailer = require('nodemailer');
const ejs = require('ejs');

const hash = require('./hash').hash;
const db = require('./db');

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

const SENDER_EMAIL = 'freegamesnewsletter@gmail.com';
const SENDER_PASSWORD = process.env.FREEGAMESNEWSLETTER_PASSWORD;

const SUBJECT = 'Confirm your subscription';

function generateHTMLmessage(email, callback) {
    const confirmUrl = 'https://www.freegamesnewsletter.tech/confirmEmail?email=' + email + '&code=' + hash(email);

    ejs.renderFile('src/email_templates/confirmation.html', {confirmUrl}, {}, function(err, html){
        callback(err, html);
    });
}

async function sendConfirmationEmail(email) {
    checkEmailAlreadySubscribed(email, (err, subscriberExist) => {
        if (subscriberExist) {
            console.log(email + ' already subscribed! Ignoring...');
            return;
        }
        console.log('Sending confirmation email to:' + email);

        let transporter = createTransport();

        transporter.verify(function(error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Ready to send messages via SMTP');
                
                generateHTMLmessage(email, async function(error, html) {
                    if (error) {
                        console.log('Failed to send email to %s: %s', email, error);
                    } else {
                        let info = await transporter.sendMail({
                            from: SENDER_EMAIL,
                            to: email,
                            subject: SUBJECT,
                            html: html,
                        });
                        console.log('Confirmation email sent to %s: %s', email, info);
                    }
                });
            }
        });
    });
}

function checkEmailAlreadySubscribed(email, callback) {
    db.findSubscriber(email, (err, subscriber) => {
        if (err) {
            callback(err, null);
        } else if (subscriber) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
}

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
}

module.exports = {sendConfirmationEmail};