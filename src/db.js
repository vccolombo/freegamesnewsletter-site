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

async function insertSubscriber(subscriber) {
    let subscriberWithThisEmail = await findSubscriber(subscriber.email);
    if (subscriberWithThisEmail) {
        throw "subscriberAlreadyExists";
    }
    
    let insert = new Subscribers(subscriber);
    return insert.save();
};

async function findSubscriber(subscriberEmail) {
    return Subscribers.findOne({'email': subscriberEmail});
};

async function removeSubscriber(subscriberEmail) {
    return Subscribers.findOneAndDelete({'email': subscriberEmail});
};

module.exports = {insertSubscriber, removeSubscriber, findSubscriber};