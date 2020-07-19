const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    unsubscribeCode: {
        type: String,
        required: true
    }
}, {
    versionKey: false
});

const Subscribers = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscribers