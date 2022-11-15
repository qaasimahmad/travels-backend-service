//require("../../lib/mongo");
let throng           = require('throng');
const UserService    = require("../../services/users");
const BookingService = require("../../services/bookings");
const logger         = require("../../lib/logger");
const Redis          = require("ioredis");
const Queue          = require("bull");
const dotenv         = require("dotenv");

dotenv.config();

const EventEmitter               = require("events");

EventEmitter.defaultMaxListeners = 50;

let workers = process.env.WEB_CONCURRENCY || 2;


let redisUrl = null;
if(process.env.REDIS_URL){
  redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
}

const client     = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false
});

const subscriber              = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false
});
const opts                    = {
  createClient: function(type){
    switch(type){
    case "client":
      return client;
    case "subscriber":
      return subscriber;
    default:
      return new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck:     false
      });
    }
  }
};
const updateUserBookingsQueue = new Queue("UPDATE_USER_BOOKING", opts);

function start(){

  updateUserBookingsQueue.process(async(job)=>{
    try{
      const bookingData = job.data;

      logger.info(`Procesing job for ${bookingData.bookingId}...`);
      let addOns      = await client.hgetall(`${bookingData.userId}:addons`);
      addOns ? addOns = addOns : addOns = {};
      logger.info(`AddOns Fetched from Redis ✔ ${addOns}`);
      try{
        await new BookingService().updateBookings({_id: bookingData.bookingId}, {addOns});
        logger.info('Bookings Updated Successfully! ✔');
      } catch(error){
        logger.error('Bookings Failed to Update! ✖');
      }
      await new UserService().updateUser({_id: bookingData.userId},
        {
          bookingStatus:     bookingData.bookingStatus,
          bookingId:         bookingData.bookingId,
          bookingProviderRef: bookingData.bookingProviderRef,
          bookingIdProvider: bookingData.bookingIdProvider,
        });
      logger.info("User Updated Successfully! ✔");
    } catch(error){
      throw new Error("Unhandled error", error);
    }
  });
}
throng({ workers, start });

module.exports = {
  updateUserBookingsQueue,
  client
}
