var express = require('express');
var router = express.Router();
var CategoryController = require('../controllers/CategoryController.js');
var middlewares = require("../utils/middleware.js");



//Create a category
router.post('/create', middlewares.checkToken, CategoryController.create);

//Delete a category
router.delete('/:id', middlewares.checkToken, CategoryController.delete);

//Get all categories
router.get('/list', CategoryController.list);



module.exports = router;