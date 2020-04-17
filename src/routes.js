const express = require('express');
const { check, body, validationResult } = require('express-validator');

const subscriptionManager = require('./subscriptionManager');

const router = express.Router();

router.get('/', (req, res) => {
    return res.render('pages/home');
});

router.post('/subscribe', [
    body('email').isEmail().normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    subscriptionManager.subscribe(email, (err, success) => {
        return res.redirect('/subscribe-success');
    });
});

router.get('/subscribe-success', (req, res) => {
    res.render('pages/subscribeSuccess');
})

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
        console.log(errors);
        return res.render('pages/unsubscribeFailed');
    }

    const email = req.query.email;
    const code = req.query.code;
    subscriptionManager.unsubscribe(email, code, (err, success) => {
        if (err) {
            return res.render('pages/unsubscribeFailed');
        }

        return res.render('pages/unsubscribeSuccess');
    }); 
});


module.exports = router;