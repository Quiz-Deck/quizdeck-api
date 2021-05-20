
const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


let mongoose = require('mongoose'); // for working w/ our database
let config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true });

const userRoutes = require('./routes/UserRoutes');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cors());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization');
  res.setHeader('X-Powered-By', 'Lucky Lucciano');
  next();
});


app.use(function(req, res, next) {
  next(); 
});

app.use('/', userRoutes);

app.use(function(req, res) {
  return res.status(404).send({ message: 'The url you visited does not exist' });
});

app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`)
})