const db = require('./db');
const hash = require('./hash').hash;
const emailer = require('./emailer');

const sendConfirmationEmail = (email, callback) => {
    emailer.sendConfirmationEmail(email);

    return callback(null, 'Success');
};

const subscribe = (email, code, callback) => {
    const emailHashed = hash(email);
    if (emailHashed === code) {
        const unsubscribeCode = hash(email + generateRandomString(16));
        doSubscription(email, unsubscribeCode, (err, success) => {
            return callback(err, success);
        });
    } else {
        return callback('NonMatchingHashes', null);
    }
};

function generateRandomString(length) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const doSubscription = (email, unsubscribeCode, callback) => {
    subscriber = {
        'email': email,
        'unsubscribeCode': unsubscribeCode
    };

    db.insertSubscriber(subscriber, (err, success) => {
        return callback(err, success);
    });
};

const unsubscribe = (email, unsubscribeCode, callback) => {
    db.findSubscriber(email, (err, subscriber) => {
        if (err) {
            return callback(err, null);
        } else if (!subscriber) {
            return callback("EmailNotFound", null);
        }

        const unsubscribeCodeFromDB = subscriber.unsubscribeCode;
        if (unsubscribeCodeFromDB === unsubscribeCode) {
            doUnsubscription(email, (err, success) => {
                return callback(err, success);
            });
        } else {
            return callback('NonMatchingHashes', null);
        }
    });
};

const doUnsubscription = (email, callback) => {
    db.removeSubscriber(email, (err, success) => {
        return callback(err, success);
    });
};

module.exports = {sendConfirmationEmail, subscribe, unsubscribe};