/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const marketingCollection = config.mongo.collections.contactList;

const marketingSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
    },
    status: {
      type:     String,
      required: true
    },
    isDeleted: {
      type:    Boolean,
      default: false
    }
  },
  {timestamps: true}
);

marketingSchema.plugin(mongoosePaginate);

marketingSchema.index({ "$**": "text" });

const payment = mongoose.model(marketingCollection, marketingSchema);

module.exports = payment;