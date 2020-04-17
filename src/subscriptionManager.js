const crypto = require('crypto');

const db = require('./db');

require('dotenv').config();
const SECRET = process.env.NEWSLETTER_SECRET;

const hash = (string) => {
    const hmac = crypto.createHmac('sha256', SECRET);
    const hashedString = hmac.update(string).digest('hex');

    return hashedString;
}

const subscribe = (email, callback) => {
    const emailHashed = hash(email);

    doSubscription(email, emailHashed, (err, success) => {
        return callback(err, success);
    });
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

module.exports = {subscribe, unsubscribe};