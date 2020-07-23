var amqp = require('amqplib/callback_api');
var amqpConn = null;

const CONN_URL = 'amqp://rabbitmq/';
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASS = process.env.RABBITMQ_PASS;

function start() {
    const opt = { 
        credentials: amqp.credentials.plain(
            RABBITMQ_USER, RABBITMQ_PASS)
    };
    amqp.connect(CONN_URL + '?heartbeat=60', opt, function(err, conn) {
        if (err) {
            console.log('[AMQP]', err.message);
            return setTimeout(start, 1000);
        }
        conn.on('error', function(err) {
            if (err.message !== 'Connection closing') {
                console.log('[AMQP] conn error', err.message);
            }
        });
        conn.on('close', function() {
            console.log('[AMQP] reconnecting');
            return setTimeout(start, 1000);
        });
        console.log('[AMQP] connected');
        amqpConn = conn;
        startPublisher();
    });
}

var pubChannel = null;
function startPublisher() {
    amqpConn.createChannel(function(err, ch) {
        if (err) {
            return console.log(err);
        }
        
        ch.on('error', function(err) {
            console.log('[AMQP] channel error', err.message);
        });
        ch.on('close', function() {
            console.log('[AMQP] channel closed');
        });

        pubChannel = ch;
    });
}

function publish(exchange, routingKey, content) {
    msg = Buffer.from(content);
    pubChannel.publish(exchange, routingKey, msg, { persistent: true }, 
        function(err, ok) {
            if (err) {
                return console.log('[AMQP] publish', err);
            }

            console.log('[AMQP] publish', ok);
        });
}

start();

module.exports = {publish};
