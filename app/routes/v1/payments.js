const express         = require('express');
const route           = express.Router();
const { verifyToken } = require("../../middleware/verifyToken");
const paymentSchema   = require('../../lib/schemas/payment');
const validator       = require('../../middleware/validator');

// used to enable catching and handling errors globally
const asyncHandler = require('express-async-handler');

const PaymentController  = require('../../controllers/payment');
const PostbackController = require('../../controllers/postback');

route.post('/', validator(paymentSchema),
  verifyToken,
  asyncHandler((req, res) => PaymentController.initiatePayments(req, res)));
route.get('/dlr', asyncHandler((req, res) => PostbackController.verifyPayment(req, res)));

module.exports = route;