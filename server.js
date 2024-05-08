
const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const appstorage = require("./utils/nodepersist");
require('dotenv').config()


let mongoose = require('mongoose'); // for working w/ our database
let config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true });

if(!appstorage.get("blacklist")) { //for setting the stage for storing expired tokens.
  appstorage.set("blacklist", []);
}

const userRoutes = require('./routes/UserRoutes');
const deckRoutes = require('./routes/DeckRoutes');
const questionRoutes = require('./routes/QuestionRoutes')


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
app.use('/deck', deckRoutes);
app.use('/question', questionRoutes);

app.use(function(req, res) {
  return res.status(404).send({ message: 'The url you visited does not exist' });
});


app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`)
})