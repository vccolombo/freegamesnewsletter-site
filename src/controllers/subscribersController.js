const hash = require('../utils/hashUtils').hash;
const generateRandomString = require('../utils/stringUtils').generateRandomString;
const mailer = require('../models/mailer');
const Subscribers = require('../models/subscribers');

function sendConfirmationEmail(email, callback) {
    mailer.sendConfirmationEmail(email);

    return callback(null, 'Success');
};

function subscribe(email, code, callback) {
    const emailHashed = hash(email);
    if (emailHashed !== code) {
        return callback('NonMatchingHashes', null);
    }

    const unsubscribeCode = hash(email + generateRandomString(16));
    let subscriber = new Subscribers({
        'email': email,
        'unsubscribeCode': unsubscribeCode
    });

    subscriber.save().then((result) => {
        return callback(null, result);
    }).catch((error) => {
        if (error.name === 'MongoError' && error.code === 11000) {
            return callback (null, 'AlreadySubscribed');
        }

        return callback(error, null);
    });
};

function unsubscribe(email, unsubscribeCode, callback) {
    Subscribers.findOne({'email': email}).then((subscriber) => {
        if (!subscriber) {
            return callback('EmailNotFound', null);
        }

        const unsubscribeCodeFromDB = subscriber.unsubscribeCode;
        if (unsubscribeCodeFromDB !== unsubscribeCode) {
            return callback('NonMatchingHashes', null);
        }

        Subscribers.deleteOne({'email': email}).then((result) => {
            return callback(null, result);
        }).catch((error) => {
            return callback(error, null);
        });
    }).catch((error) => {
        
    });
};

module.exports = {sendConfirmationEmail, subscribe, unsubscribe};
