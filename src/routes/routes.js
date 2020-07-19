const express = require('express');
const axios = require('axios');
const validator = require('validator');

const subscribersController = require('../controllers/subscribersController');

require('dotenv').config();
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
const RECAPTCHA_URL = 
    'https://www.google.com/recaptcha/api/siteverify?secret=' + RECAPTCHA_KEY;

const router = express.Router();

router.get('/', (req, res) => {
    return res.render('pages/home');
});

router.post('/subscribe', (req, res) => {
    var email = validator.unescape(req.body.email)
    if (!validator.isEmail(email)) {
        response = {
            'responseCode': 1, 
            'responseMessage': 'Invalid Email'
        };
        return res.status(400).json(response);
    }
    email = validator.normalizeEmail(email);

    const captchaResponse = req.body['g-recaptcha-response'][0]
    if (captchaResponse === undefined || captchaResponse === '' || captchaResponse === null) {
        response = {
            'responseCode': 1, 
            'responseMessage': 'Please select captcha'
        };
        return res.status(400).json(response);
    }

    const verificationUrl = RECAPTCHA_URL 
        + '&response=' + captchaResponse 
        + '&remoteip=' + req.connection.remoteAddress;
    axios.get(verificationUrl).then((response) => {
        if (response.data.success) {
            subscribersController.sendConfirmationEmail(email, (err, success) => {
                return res.status(200).json(
                    {'responseCode': 0, 'responseMessage': 'Success', 'redirect': '/checkYourEmail'});
            });
        } else {
            return res.status(400).json({'responseCode': 1, 'responseMessage': 'Failed Captcha'});
        }
    }).catch((error) => {
        console.log(error);
        return res.status(502).json({'responseCode': 1, 'responseMessage': 'Connection Error'});
    }); 
});

router.get('/checkYourEmail', (req, res) => {
    res.render('pages/checkYourEmail');
});

router.get('/confirmEmail', (req, res) => {
    var email = validator.unescape(req.query.email)
    if (!validator.isEmail(email)) {
        return res.render('pages/subscribeFailed');
    }
    email = validator.normalizeEmail(email);

    var code = validator.unescape(req.query.code);
    if (!validator.isHash(code, 'sha256')) {
        console.log(email, code, "isNotHashError");
        return res.render('pages/subscribeFailed');
    }

    subscribersController.subscribe(email, code, (err, success) => {
        if (err) {
            console.log(email, err);
            return res.render('pages/subscribeFailed');
        }
        if (success !== 'AlreadySubscribed') {
            console.log(email, 'has subscribed');
        }

        return res.render('pages/subscribeSuccess');
    }); 
});

router.get('/unsubscribe', (req, res) => {
    var email = validator.unescape(req.query.email)
    if (!validator.isEmail(email)) {
        return res.render('pages/unsubscribeFailed');
    }
    email = validator.normalizeEmail(email);

    var code = validator.unescape(req.query.code);
    if (!validator.isHash(code, 'sha256')) {
        console.log(email, code, "isNotHashError");
        return res.render('pages/unsubscribeFailed');
    }

    subscribersController.unsubscribe(email, code, (err, success) => {
        if (err) {
            console.log(email, err);
            return res.render('pages/unsubscribeFailed');
        }

        console.log(email, 'has unsubscribed');
        return res.render('pages/unsubscribeSuccess');
    }); 
});


module.exports = router;
