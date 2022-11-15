/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const airportsCollection = config.mongo.collections.airports;

const airpotsSchema = new mongoose.Schema(
  {
    city: {
      type:     String,
      required: true,
      unique:   true
    },
    country: {
      type:     String,
      required: true,
      unique:   true
    },
    code: {
      type:     String,
      required: true,
    },
  },
  {timestamps: true}
);

airpotsSchema.plugin(mongoosePaginate);

airpotsSchema.index({ "$**": "text" });

const user = mongoose.model(airportsCollection, airpotsSchema);

module.exports = user;
