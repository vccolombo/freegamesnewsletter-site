const express = require('express');
const axios = require('axios');
const { check, body, validationResult } = require('express-validator');

const subscriptionManager = require('./subscriptionManager');

require('dotenv').config();
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
const RECAPTCHA_URL = 
    'https://www.google.com/recaptcha/api/siteverify?secret=' + RECAPTCHA_KEY;

const router = express.Router();

router.get('/', (req, res) => {
    return res.render('pages/home');
});

router.post('/subscribe', [
    body('email').unescape().normalizeEmail().isEmail(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        response = {
            'responseCode': 1, 
            'responseMessage': 'Invalid Email'
        };
        return res.status(400).json(response);
    }

    const captchaResponse = req.body['g-recaptcha-response'][0]
    if (captchaResponse === undefined || captchaResponse === '' || captchaResponse === null) {
        response = {
            'responseCode': 1, 
            'responseMessage': 'Please select captcha'
        };
        return res.status(400).json(response);
    }

    const email = req.body.email;
    const verificationUrl = RECAPTCHA_URL 
        + '&response=' + captchaResponse 
        + '&remoteip=' + req.connection.remoteAddress;
    axios.get(verificationUrl)
        .then((response) => {
            if (response.data.success) {
                subscriptionManager.sendConfirmationEmail(email, (err, success) => {
                    return res.status(200).json({'responseCode': 0, 'responseMessage': 'Success', 'redirect': '/checkYourEmail'});
                });
            } else {
                return res.status(400).json({'responseCode': 1, 'responseMessage': 'Failed Captcha'});
            }
        })
        .catch((error) => {
            console.log(error);
            return res.status(502).json({'responseCode': 1, 'responseMessage': 'Connection Error'});
        }); 
});

router.get('/checkYourEmail', (req, res) => {
    res.render('pages/checkYourEmail');
});

router.get('/confirmEmail', [
    check('email').unescape().isEmail().normalizeEmail(),
    check('code')
        .unescape()
        .trim()
        .not().isEmpty()
        .isAlphanumeric()
        .isHash('sha256')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/unsubscribeFailed');
    }

    const email = req.query.email;
    const code = req.query.code;
    subscriptionManager.subscribe(email, code, (err, success) => {
        if (err) {
            // TODO
            console.log(err);
        }

        return res.render('pages/subscribeSuccess');
    }); 
});

router.get('/subscribeSuccess', (req, res) => {
    res.render('pages/subscribeSuccess');
});

router.get('/unsubscribe', [
    check('email').unescape().isEmail().normalizeEmail(),
    check('code')
        .unescape()
        .trim()
        .not().isEmpty()
        .isAlphanumeric()
        .isHash('sha256')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/unsubscribeFailed');
    }

    const email = req.query.email;
    const code = req.query.code;
    subscriptionManager.unsubscribe(email, code, (err, success) => {
        if (err) {
            console.log(err);
            return res.render('pages/unsubscribeFailed');
        }

        console.log(email + ' has unsubscribed!');
        return res.render('pages/unsubscribeSuccess');
    }); 
});


module.exports = router;