const nodemailer = require('nodemailer');
const ejs = require('ejs');

const hash = require('./hash').hash;

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
    let transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
    });

    // verify connection configuration
    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
            
            generateHTMLmessage(email, async function(error, html) {
                let info = await transporter.sendMail({
                    from: SENDER_EMAIL,
                    to: email,
                    subject: SUBJECT,
                    html: html,
                });
                console.log('Message sent: %s', info);
            });
        }
    });
}

module.exports = {sendConfirmationEmail};