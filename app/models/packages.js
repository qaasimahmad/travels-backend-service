/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const flightPackageCollection = config.mongo.collections.packages;

const flightPackageSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      ref:      "users",
    },
    flightPackageId: {
      type:     String,
      default:  null,
      required: true
    },
    name: {
      type:     String,
      required: true,
      unique:   true
    },
    price: {
      type:     String,
      required: true
    },
    caption: {
      type:     String,
      required: true
    },
    content: {
      type:     Array,
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
    endDate: {
      type:     String,
      required: true
    },
    passengerType: {
      type:     Array,
      required: true
    },
    photos: {
      type: Array,
    },
  },
  {timestamps: true}
);

flightPackageSchema.plugin(mongoosePaginate);

flightPackageSchema.index({ "$**": "text" });

const flightPackage = mongoose.model(flightPackageCollection, flightPackageSchema);

module.exports = flightPackage;