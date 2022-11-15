/**
 * @Author: Kass
 * @Objective: building to scale
 */

const mongoose         = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const config           = require("../config/config");

const paymentCollection = config.mongo.collections.payments;

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      ref:      "users",
    },
    transactionRef: {
      type:     String,
      required: true,
    },
    amount: {
      type:     Number,
      required: true
    },
    status: {
      type:    String,
      enum:    [ 'pending', 'paid' ],
      default: 'pending'
    }
  },
  {timestamps: true}
);

paymentSchema.plugin(mongoosePaginate);

paymentSchema.index({ "$**": "text" });

const payment = mongoose.model(paymentCollection, paymentSchema);

module.exports = payment;