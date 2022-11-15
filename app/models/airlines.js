/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const airportsCollection = config.mongo.collections.airlines;

const airpotsSchema = new mongoose.Schema(
  {
    code: {
      type:     String,
      required: true,
      unique:   true
    },
    name: {
      type:     String,
      required: true,
      unique:   true
    },
    logo: {
      type:     String,
      required: true,
    },
  },
  {timestamps: true}
);

airpotsSchema.plugin(mongoosePaginate);

airpotsSchema.index({ "$**": "text" });

const airlines = mongoose.model(airportsCollection, airpotsSchema);

module.exports = airlines;