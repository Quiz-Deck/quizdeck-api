var UserModel = require("../models/UserModel.js");
var config = require("../config");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

module.exports = {
  register: async function (req, res) {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email address is required." });
    }
    if (!config.validateEmail(req.body.email)) {
      return res.status(400).json({ message: "Email address is not valid." });
    }
    if (!req.body.password) {
      return res
        .status(400)
        .json({ message: "Provide a password to secure your account." });
    }

    try {
      let user = await UserModel.findOne({
        email: req.body.email.trim().toLowerCase(),
      }).exec();

      if (user) {
        return res.status(404).json({
          success: false,
          message: "User already exists.",
        });
      }

      var newUser = new UserModel({
        email: req.body.email,
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        isSubscribed: false,
        subscriptionExpiresAt: null,
      });

      newUser
        .save()
        .then((savedUser) => {
          const responseUser = { ...savedUser._doc };
          delete responseUser.password;
          return res
            .status(201)
            .json({ message: "User created successfully", data: responseUser });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Error when creating User",
            error: err,
          });
        });
    } catch (error) {
      return res.status(500).json({
        message: "Error processing requests.",
        error: error,
      });
    }
  },

  login: async function (req, res) {
    if (!req.body.email)
      return res.status(400).json({ message: "email-required" });
    if (!req.body.password)
      return res.status(400).json({ message: "password-required" });

    try {
      let user = await UserModel.findOne({
        email: req.body.email.trim().toLowerCase(),
      }).exec();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      let match = await bcrypt.compare(
        req.body.password.trim(),
        user.password.trim()
      );

      if (!match) {
        return res.status(404).json({
          success: false,
          message: "Email or Password incorrect",
        });
      } else {
        var token = jwt.sign(
          {
            email: user.email,
            _id: user._id,
            role: user.role,
          },
          config.secret,
          {
            expiresIn: 86400000 * 30, // expires in 30 days
          }
        );
        const responseUser = { ...user._doc };
        delete responseUser.password;

        // added this to update subscription status
        responseUser.subscriptionStatus = {
          isSubscribed: user.isSubscribed,
          daysLeft: user.subscriptionExpiresAt
            ? Math.ceil(
                (new Date(user.subscriptionExpiresAt) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        };

        return res.status(200).json({
          success: true,
          message: "Login successful!",
          token: token,
          data: responseUser,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error processing requests.",
        error: error,
      });
    }
  },

  subscribe: async function (req, res) {
    const userId = req.user?._id || req.body.userId; // from middleware or body
    const durationInDays = req.body.duration || 30;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const user = await UserModel.findById(userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      const now = new Date();
      const newExpiry = new Date(
        now.getTime() + durationInDays * 24 * 60 * 60 * 1000
      );

      user.isSubscribed = true;
      user.subscriptionExpiresAt = newExpiry;
      await user.save();

      return res.status(200).json({
        message: "Subscription activated",
        expiresAt: user.subscriptionExpiresAt,
      });
    } catch (error) {
      return res.status(500).json({ message: "Subscription error", error });
    }
  },

  verifyPayment: async function (req, res) {
    const { reference, userId } = req.body;

    if (!reference || !userId) {
      return res.status(400).json({ message: "Missing reference or userId" });
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paymentData = response.data.data;

      if (paymentData.status !== "success") {
        return res.status(400).json({ message: "Payment was not successful" });
      }

      // Activate subscription
      const user = await UserModel.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const daysToAdd = 30; // e.g., 30-day subscription
      const newExpiration = new Date(
        Date.now() + daysToAdd * 24 * 60 * 60 * 1000
      );

      user.isSubscribed = true;
      user.subscriptionExpiresAt = newExpiration;
      await user.save();

      res.status(200).json({
        message: "Subscription activated!",
        expiresAt: newExpiration,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Payment verification failed" });
    }
  },
};
