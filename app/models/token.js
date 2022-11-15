/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const tokenCollection = config.mongo.collections.tokens;

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      ref:      "users",
    },
    token: {
      type:     String,
      required: true,
    },
    createdAt: {
      type:    Date,
      default: Date.now,
      expires: 3600,// this is the expiry time in seconds
    },
  }
);

tokenSchema.plugin(mongoosePaginate);

tokenSchema.index({ "$**": "text" });

const token = mongoose.model(tokenCollection, tokenSchema);

module.exports = token;