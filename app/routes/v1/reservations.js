const express              = require('express');
const route                = express.Router();
const { verifyTokenAdmin } = require("../../middleware/verifyToken");
const reservationSchema    = require('../../lib/schemas/reservation');
const validator            = require('../../middleware/validator');

// used to enable catching and handling errors globally
const asyncHandler = require('express-async-handler');

const ReservationController  = require('../../controllers/reservations');

route.post('/createReservation', validator(reservationSchema),
  asyncHandler((req, res) => ReservationController.createFlightReservation(req, res)));

route.get(
  "/getReservation/:id",
  asyncHandler((req, res) => ReservationController.getFlightReservationById(req, res))
);

route.get(
  "/getReservations",verifyTokenAdmin,
  asyncHandler((req, res) => ReservationController.getFlightReservations(req, res))
);
// Not Tested
route.delete(
  "/remove/:id",verifyTokenAdmin,
  asyncHandler((req, res) => ReservationController.deleteFlightReservation(req, res))
);

module.exports = route;