const crypto = require('crypto');

require('dotenv').config();
const SECRET = process.env.NEWSLETTER_SECRET;

const hash = (string) => {
    const hmac = crypto.createHmac('sha256', SECRET);
    const hashedString = hmac.update(string).digest('hex');

    return hashedString;
}

module.exports = {hash};
