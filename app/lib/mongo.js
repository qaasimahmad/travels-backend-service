/* eslint-disable no-undef */
const mongoose   = require("mongoose");
const logger     = require("./logger");
const {switchDb} = require("../lib/utils");

mongoose.Promise = global.Promise;

const dbUrl = switchDb();

mongoose
  .connect(dbUrl, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("mongodb connected");
  })
  .catch((error) => {
    logger.info("mongodb not connected", error);
  });

module.exports = mongoose;
