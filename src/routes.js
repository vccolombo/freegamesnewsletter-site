const express = require('express');

const subscriptionManager = require('./subscriptionManager');

const router = express.Router();

router.get('/', (req, res) => {
    return res.render('pages/home');
});

router.post('/subscribe', (req, res) => {
    const email = req.body.email;
    if (email) {
        subscriptionManager.subscribe(email, (err, success) => {
            if (err) {
                return res.redirect('back');
            } 
            return res.redirect('/subscribe-success');
        });
    } else {

    }
});

router.get('/subscribe-success', (req, res) => {
    res.render('pages/subscribeSuccess');
})

router.get('/unsubscribe', (req, res) => {
    const email = req.query.email;
    const code = req.query.code;

    if (email && code) {
        subscriptionManager.unsubscribe(email, code, (err, success) => {
            if (err) {
                return res.render('pages/unsubscribeFailed');
            }

            return res.render('pages/unsubscribeSuccess');
        });    
    } else {
        return res.render('pages/unsubscribeFailed');
    }
});


module.exports = router;