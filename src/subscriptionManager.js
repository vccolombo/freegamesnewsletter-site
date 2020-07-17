const db = require('./db');
const hash = require('./hash').hash;
const mailer = require('./mailer');

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
    doSubscription(email, unsubscribeCode)
        .then((subscriber) => {
            return callback(null, subscriber);
        })
        .catch((err) => {
            return callback(err, null);
        });
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

function doSubscription(email, unsubscribeCode) {
    subscriber = {
        'email': email,
        'unsubscribeCode': unsubscribeCode
    };

    return db.insertSubscriber(subscriber);
};

function unsubscribe(email, unsubscribeCode, callback) {
    db.findSubscriber(email).then((subscriber) => {
        if (!subscriber) {
            return callback("EmailNotFound", null);
        }
    
        const unsubscribeCodeFromDB = subscriber.unsubscribeCode;
        if (unsubscribeCodeFromDB !== unsubscribeCode) {
            return callback('NonMatchingHashes', null);
        } 

        doUnsubscription(email)
            .then((subscriber) => {
                return callback(null, subscriber);
            })
            .catch((err) => {
                return callback(err, null);
            });
    }); 
};

function doUnsubscription(email) {
    return db.removeSubscriber(email);
};

module.exports = {sendConfirmationEmail, subscribe, unsubscribe};