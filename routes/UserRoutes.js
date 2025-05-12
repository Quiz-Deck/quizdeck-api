var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController.js');



//Create account
router.post('/register', UserController.register);

//Login to account
router.post('/login', UserController.login);

//Subscribe to pro
router.post('/subscribe', UserController.subscribe);

//Verify subscription payment
router.post("/api/verify-payment", UserController.verifyPayment);



module.exports = router;