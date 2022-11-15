/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const flightReservationCollection = config.mongo.collections.reservation;

const flightReservationSchema = new mongoose.Schema(
  {
    flightPackageId: {
      type:     String,
      required: true
    },
    surname: {
      type:     String,
      required: true
    },
    firstName: {
      type:     String,
      required: true
    },
    middleName: {
      type:     String,
      required: true
    },
    phoneNumber: {
      type:     String,
      required: true
    },
    email: {
      type:     String,
      required: true
    },
    from: {
      type:     String,
      required: true
    },
    to: {
      type:     String,
      required: true
    },
    returnDate: {
      type:     String,
      required: true
    },
    passengerType: {
      type:     Array,
      required: true
    },
    isActive: {
      type:    Boolean,
      default: false
    }
  },
  {timestamps: true}
);

flightReservationSchema.plugin(mongoosePaginate);

flightReservationSchema.index({ "$**": "text" });

const flightReservation = mongoose.model(flightReservationCollection, flightReservationSchema);

module.exports = flightReservation;