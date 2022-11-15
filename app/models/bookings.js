/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * @Author: Kass
 * @Objective: building to scale
 */

//TODO : Add extra fields to this Schema to cater for booking details
const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const bookingCollection = config.mongo.collections.bookings;

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      ref:      "users",
    },
    bookingIdProvider: {
      type:     String,
      default:  "None",
      required: true
    },
    bookingProviderRef: {
      type: String,
      default: "None",
      required: true,
    },
    ticketNumber: {
      type:     String,
      default:  "None",
      required: true
    },
    associatedRecords:  {type: Array} ,
    flightOffers:       {type: Array} ,
    travelers:          {type: Array} ,
    ticketingAgreement: {
      type: Object
    },
    addOns: {type: Object}
  },
  {timestamps: true}
);

bookingSchema.plugin(mongoosePaginate);

bookingSchema.index({ "$**": "text" });

const booking = mongoose.model(bookingCollection, bookingSchema);

module.exports = booking;
