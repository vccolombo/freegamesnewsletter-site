const mongoose = require('mongoose');

require('dotenv').config();
const DB_CONN = process.env.DB_CONN;

mongoose.connect(DB_CONN, {useNewUrlParser: true, useUnifiedTopology: true});

const subscriberSchema = new mongoose.Schema({
    email: String,
    unsubscribeCode: String
}, {
    versionKey: false
});
const Subscribers = mongoose.model('Subscriber', subscriberSchema);

insertSubscriber = (subscriber, callback) => {
    findSubscriber(subscriber.email, (err, docs) => {
        if (err) {
            return callback(err, null)
        } else if (docs) {
            return callback('SubscriberAlreadyExists', null);
        }

        const insert = new Subscribers(subscriber);
        insert.save();

        return callback(null, 'SubscriberAdded');
    });
};

removeSubscriber = (subscriberEmail, callback) => {
    Subscribers.findOneAndDelete({
        'email': subscriberEmail
    }, (err, success) => {
        if (err) {
            return callback('CouldNotDeleteSubscriber', null);
        } else if (success) {
            return callback(null, 'SubscriberRemoved');
        } else {
            return callback('SubscriberNotFound', null);
        } 
    });
};

findSubscriber = (subscriberEmail, callback) => {
    Subscribers.findOne({'email': subscriberEmail}, (err, docs) => {
        if (err) {
            return callback(err, null);
        } 

        return callback(null, docs);
    });
};

module.exports = {insertSubscriber, removeSubscriber, findSubscriber};