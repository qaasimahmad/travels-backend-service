const express = require("express");
const route   = express.Router();

// used to enable catching and handling errors globally
const asyncHandler = require("express-async-handler");

const AuthController = require("../../controllers/auth");

route.get(
  "/confirm/:confirmationCode",
  asyncHandler((req, res) => AuthController.verifyUser(req, res))
);

route.post(
  "/requestPasswordReset",
  asyncHandler((req, res) => AuthController.requestPasswordReset(req, res))
);

route.post(
  "/resetPassword",
  asyncHandler((req, res) => AuthController.resetPassword(req, res))
);

module.exports = route;