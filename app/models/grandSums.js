/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * @Author: Kass
 * @Objective: building to scale
 */
const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const grandSumCollection = config.mongo.collections.grandSums;

const grandSumSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      ref:      "users",
    },
    username: {
      type:     String,
      required: true
    },
    grandTotal: {
      type:     String,
      required: true
    },
  },
  {timestamps: true}
);

grandSumSchema.plugin(mongoosePaginate);

grandSumSchema.index({ "$**": "text" });

const grandSum = mongoose.model(grandSumCollection, grandSumSchema);

module.exports = grandSum;
