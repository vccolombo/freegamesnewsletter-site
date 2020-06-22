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
        doSubscription(email, emailHashed, (err, success) => {
            return callback(err, success);
        });
    } else {
        return callback('NonMatchingHashes', null);
    }
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

const unsubscribe = (email, code, callback) => {
    const emailHashed = hash(email);

    if (emailHashed === code) {
        doUnsubscription(email, (err, success) => {
            return callback(err, success);
        });
    } else {
        return callback('NonMatchingHashes', null);
    }
};

const doUnsubscription = (email, callback) => {
    db.removeSubscriber(email, (err, success) => {
        return callback(err, success);
    });
};

module.exports = {sendConfirmationEmail, subscribe, unsubscribe};