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

const userCollection = config.mongo.collections.users;

const userSchema = new mongoose.Schema(
  {
    username: {
      type:     String,
      required: true
    },
    email: {
      type:     String,
      required: true,
      unique:   true,
    },
    password: {
      type:     String,
      required: true,
    },
    status: {
      type:    String,
      enum:    [ "Pending", "Active" ],
      default: "Pending",
    },
    bookingStatus: {
      type:    String,
      enum:    [ "NotBooked", "Initiated", "Booked" ],
      default: "NotBooked"
    },
    bookingId:         [ { type: mongoose.Schema.Types.ObjectId, ref: 'bookings' } ],
    bookingIdProvider: {type: String},
    confirmationCode:  {
      type:   String,
      unique: true,
    },
    isAdmin: {
      type:    Boolean,
      default: false,
    },
    isDeleted: {
      type:    Boolean,
      default: false
    },
    imageUrl: {
      type:    String,
      default: null
    },
    imageRaw: {
      type:    String,
      default: null
    },
    isSubscribed: {
      type:    Boolean,
      default: true
    },
    visaAssistanceRequest: {
      type:    Boolean,
      default: false
    }
  },
  {timestamps: true}
);

userSchema.plugin(mongoosePaginate);

userSchema.index({ "$**": "text" });

const user = mongoose.model(userCollection, userSchema);

module.exports = user;
