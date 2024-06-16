var express = require('express');
var router = express.Router();
var QuestionController = require('../controllers/QuestionController.js');
var middlewares = require("../utils/middleware.js");



//Create a question
router.post('/create/:deckId', middlewares.checkToken, QuestionController.create);

//Delete a question
router.delete('/:id', middlewares.checkToken, QuestionController.delete);

//Get a question
router.get('/:id', middlewares.checkToken, QuestionController.getone);

//Edit a question
router.put('/edit/:id', middlewares.checkToken, QuestionController.update);


//Invite users to a question 
// Research: Sending email invites to users



module.exports = router;