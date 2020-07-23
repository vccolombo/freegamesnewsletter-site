const mongoose = require('mongoose');

require('dotenv').config();
const DB_CONN = process.env.DB_CONN;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

mongoose.connect(DB_CONN, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    "auth": { "authSource": "admin" },
    "user": MONGODB_USER,
    "pass": MONGODB_PASS,
});
