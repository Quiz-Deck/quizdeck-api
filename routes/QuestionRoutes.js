var express = require("express");
var router = express.Router();
var QuestionController = require("../controllers/QuestionController.js");
var middlewares = require("../utils/middleware.js");

const multer = require("multer");
const path = require("path");

// // Storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/audio");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// // Filter for audio files only
// const audioFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith("audio/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only audio files are allowed!"), false);
//   }
// };

// const upload = multer({ storage: storage, fileFilter: audioFilter });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/media"); // can hold both audio and image
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Accept both audio and image files
const mediaFilter = function (req, file, cb) {
  if (
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only audio or image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter: mediaFilter });

//Create a question
// router.post('/create/:deckId', middlewares.checkToken, QuestionController.create);
router.post(
  "/create/:deckId",
  middlewares.checkToken,
  upload.array("media", 100),
  QuestionController.create
);

//Delete a question
router.delete("/:id", middlewares.checkToken, QuestionController.delete);

//Get a question
router.get("/:id", middlewares.checkToken, QuestionController.getone);

//Edit a question
router.put("/edit/:id", middlewares.checkToken, QuestionController.update);

//Invite users to a question
// Research: Sending email invites to users

module.exports = router;
