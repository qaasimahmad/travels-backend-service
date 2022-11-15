/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const visaAssistanceCollection = config.mongo.collections.visaRequests;

const visaAssistanceSchema = new mongoose.Schema(
  {
    userId: {
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
    phoneNumber: {
      type:     String,
      required: true
    },
    email: {
      type:     String,
      required: true
    },
    depatureDate: {
      type:     String,
      required: true
    },
    returnDate: {
      type:     String,
      required: true
    },
    passportNo: {
      type:     String,
      required: true
    },
    countryOfResidence: {
      type:     String,
      required: true
    },
    destinationCountry: {
      type:     String,
      required: true
    },
    message: {
      type:    String,
      default: false
    },
    passportUrl: {
      type:     String,
      required: true
    },
    passportImageRaw: {
      type:     String,
      required: true
    },
    status: {
      type:    String,
      enum:    [ 'pending', 'reolved' ],
      default: 'pending'
    }
  },
  {timestamps: true}
);

visaAssistanceSchema.plugin(mongoosePaginate);

visaAssistanceSchema.index({ "$**": "text" });

const visaAssistance = mongoose.model(visaAssistanceCollection, visaAssistanceSchema);

module.exports = visaAssistance;