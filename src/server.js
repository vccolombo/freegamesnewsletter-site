const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

require('./models/broker');
require('./db/mongoose');

const routes = require('./routes/routes');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(helmet());

app.use((req, res, next) => {
    next();
});

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).send('Sorry cant find that!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log('Server is up on port ' + PORT);
});
