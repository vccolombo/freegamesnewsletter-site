const mongoose = require('mongoose');

require('dotenv').config();
const DB_CONN = process.env.DB_CONN;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

mongoose.connect(DB_CONN, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    "auth": { "authSource": "admin" },
    "user": MONGODB_USER,
    "pass": MONGODB_PASS,
});

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
        console.log("Trying to insert duplicate subscriber: ", subscriberWithThisEmail);
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