const express = require("express");
const route   = express.Router();

// used to enable catching and handling errors globally
const asyncHandler = require("express-async-handler");

const validator = require("../../middleware/validator");

const { verifyTokenAdmin, verifyToken } = require("../../middleware/verifyToken");

const contactUsSchema = require("../../lib/schemas/contactUs");

const visaAssistanceSchema = require("../../lib/schemas/visaAssistance");

const loginSchema = require("../../lib/schemas/login");

const userSchema = require("../../lib/schemas/user");

const UserController = require("../../controllers/users");

const multer = require('multer');

const maxSize = 1 * 1000 * 1000;

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: maxSize }, });

route.post(
  "/signup",validator(userSchema),
  asyncHandler((req, res) => UserController.registerUser(req, res))
);

route.post(
  "/login",
  validator(loginSchema),
  asyncHandler((req, res) => UserController.loginUser(req, res))
);

route.post(
  "/googleSignin",
  asyncHandler((req, res) => UserController.verifyGoogleToken(req, res))
);

route.get(
  "/all",
  verifyTokenAdmin,
  asyncHandler((req, res) => UserController.getAllUsers(req, res))
);

route.get(
  "/user",
  verifyToken,
  asyncHandler((req, res) => UserController.getSingleUser(req, res))
);

route.delete(
  "/user/:id",
  verifyTokenAdmin,
  asyncHandler((req, res) => UserController.deleteUser(req, res))
);

route.post(
  "/user/contactUs",validator(contactUsSchema),
  asyncHandler((req, res) => UserController.contactUs(req, res))
);

route.post(
  "/user/requestVisaAssistance", upload.single('passport'),verifyToken, validator(visaAssistanceSchema),
  asyncHandler((req, res) => UserController.requestVisaAssistance(req, res))
);

route.get(
  "/user/getSingleVisaRequest/:id",verifyToken,
  asyncHandler((req, res) => UserController.getSingleVisaRequest(req, res))
);

route.get(
  "/user/getAllVisaRequests",verifyTokenAdmin,
  asyncHandler((req, res) => UserController.getAllVisaRequests(req, res))
);

route.patch(
  "/user/updateVisaRequest/:id", verifyTokenAdmin,
  asyncHandler((req, res) => UserController.updateVisaRequest(req, res))
);


route.put(
  "/user/:id", upload.single('profilePic'),verifyToken,
  asyncHandler((req, res) => UserController.updateUserProfile(req, res))
);

route.post(
  "/subscribeToNewsletter",
  asyncHandler((req, res) => UserController.subscribeToNewsLetter(req, res))
);

route.get(
  "/subscribers", verifyTokenAdmin,
  asyncHandler((req, res) => UserController.getAllNewsLetterSubscribers(req, res))
);

route.get(
  "/subscribers/:id", verifyTokenAdmin,
  asyncHandler((req, res) => UserController.getNewsLetterSubscriberById(req, res))
);

route.put(
  "/unsubscribe/:id",
  asyncHandler((req, res) => UserController.unSubscribeSubcriberById(req, res))
);

route.delete(
  "/delete/subscriber/:id", verifyToken,
  asyncHandler((req, res) => UserController.deleteSubscriberById(req, res))
);

module.exports = route;
