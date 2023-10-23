var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
const saltRounds = 10;

var UserSchema = new Schema({
	createdOn: { type: Date, default: Date.now },
  email: String, 
	userName: String,
  phoneNumber: String,
  password: String,
	referralCode: String,
  friends: { type: Schema.Types.ObjectId, ref: "User" },
  personalDecks: { type: Schema.Types.ObjectId, ref: "Quizes"}, //decks that has been created by the user
  generalDecks: { type: Schema.Types.ObjectId, ref: "Quizes" }, //decks that the user has been invited to
  guestDecks: { type: Schema.Types.ObjectId, ref: "Quizes" } //public decks that user has contributed a question or an answer to,
});

// hash the password before the user is saved
UserSchema.pre("save", function (next) {
  var user = this;

  // hash the password only if the password has been changed or user is new
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      // change the password to the hashed version
      user.password = hash;
      next();
    });
  });
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function (password) {
  var user = this;

  bcrypt.compare((user.password, password), function (err, result) {
    return result;
  });
};

module.exports = mongoose.model("User", UserSchema);
