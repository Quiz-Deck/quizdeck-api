var express = require('express');
var router = express.Router();
var DeckController = require('../controllers/DeckController');
var middlewares = require("../utils/middleware.js");


//Create a deck
router.post('/create', middlewares.checkToken, DeckController.create);

//Get all public decks
router.get('/public', DeckController.public);

//Edit a deck
router.put('/edit/:id', middlewares.checkToken, DeckController.update);

//Get all decks for a user
router.get('/user',middlewares.checkToken, DeckController.userdeck);

//Get a particular deck
router.get('/:id', DeckController.getone);

//Like or Unlike a deck
router.put('/:deckId/like', middlewares.checkToken, DeckController.toggleLike);

//Delete a deck
router.delete('/:id', middlewares.checkToken, DeckController.delete);




module.exports = router;