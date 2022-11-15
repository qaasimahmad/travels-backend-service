const express                   = require("express");
const route                     = express.Router();
const flightOffersSchemaPost    = require("../../lib/schemas/flightOfferPost");
const flightOffersSchemaGet     = require("../../lib/schemas/flightOffersGet");
const flightOrderSchema         = require("../../lib/schemas/flightOrder");
const flightOffersPricingSchema = require("../../lib/schemas/flightOffersPricing");

const validator     = require("../../middleware/validator");

// used to enable catching and handling errors globally
const asyncHandler                    = require("express-async-handler");
const {verifyToken, verifyTokenAdmin} = require("../../middleware/verifyToken");

const AirportController = require("../../controllers/airports");

route.get(
  "/getAirports",
  asyncHandler((req, res) => AirportController.getAirportDetails(req, res))
);

route.post(
  "/postFlightoffers", validator(flightOffersSchemaPost),
  asyncHandler((req, res) => AirportController.getFlightOffersPost(req, res))
);

route.get(
  "/getAirlinesAndCodes",
  asyncHandler((req, res) => AirportController.getAirlinesAndCodes(req, res))
);

route.get(
  "/getFlightoffers", validator(flightOffersSchemaGet),
  asyncHandler((req, res) => AirportController.getFlightOffersGet(req, res))
);

route.post(
  "/confirmFlightoffersPrice", validator(flightOffersPricingSchema),verifyToken,
  asyncHandler((req, res) => AirportController.confirmFlightOffersPricing(req, res))
);

route.post(
  "/createFlightOrder", verifyToken,validator(flightOrderSchema),
  asyncHandler((req, res) => AirportController.createFlightOrder(req, res))
);

route.get(
  "/getFlightOrders/booking/id",
  asyncHandler((req, res) => AirportController.getFlightOrderedByBookingId(req, res))
);

route.get(
  "/getFlightOrders/user/id", verifyToken,
  asyncHandler((req, res) => AirportController.getFlightOrderedByUserId(req, res))
);

route.get(
  "/getFlightOrdersAdmin", verifyTokenAdmin,
  asyncHandler((req, res) => AirportController.getAllFlightsOrderedAdmin(req, res))
);

route.delete(
  "/deleteFlightOrders/:bookingId", verifyToken,
  asyncHandler((req, res) => AirportController.deleteFlightOrdered(req, res))
);

route.post(
  "/getSeatMapsPreBooking", validator(flightOffersPricingSchema),
  asyncHandler((req, res) => AirportController.getSeatMapPreBooking(req, res))
);

module.exports = route;