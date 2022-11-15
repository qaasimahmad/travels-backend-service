const express = require("express");
const route   = express.Router();

// used to enable catching and handling errors globally
const asyncHandler = require("express-async-handler");

const FinanceController = require("../../controllers/finance");

route.get(
  "/transactions",
  asyncHandler((req, res) => FinanceController.fetchAllBookingsRevenue(req, res))
);

module.exports = route;