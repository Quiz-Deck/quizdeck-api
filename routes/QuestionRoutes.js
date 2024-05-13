var express = require('express');
var router = express.Router();
var QuestionController = require('../controllers/QuestionController.js');
var middlewares = require("../utils/middleware.js");



//Create a question
router.post('/create/:deckId', middlewares.checkToken, QuestionController.create);

//Edit a question
router.put('/edit/:id', middlewares.checkToken, QuestionController.update);

//Delete a question
router.delete('/:id', middlewares.checkToken, QuestionController.delete);

//Get a question
router.get('/:id', middlewares.checkToken, QuestionController.getone);


//Invite users to a question 




module.exports = router;