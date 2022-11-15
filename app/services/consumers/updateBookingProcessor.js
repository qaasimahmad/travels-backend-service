//require("../../lib/mongo");
// const UserService    = require("../../services/users");
// const BookingService = require("../../services/bookings");
// const logger         = require("../../lib/logger");

// const {client, updateUserBookingsQueue} = require("../queues/index");

// const EventEmitter               = require("events");

// EventEmitter.defaultMaxListeners = 50;

// module.exports = async function({data}){
//   try{
//     const bookingData = data;

//     logger.info(`Procesing job for ${bookingData.bookingId}...`);
//     const addOns      = await client.hgetall(`${bookingData.userId}:addons`);
//     if(addOns){
//       logger.info(`AddOns Fetched from Redis ${addOns}`);
//       try{
//         await new BookingService().updateBookings({_id: bookingData.bookingId}, {addOns});
//         logger.info('Bookings Updated Successfully!');
//       } catch(error){
//         logger.error('Bookings Failed to Update!');
//       }
//     } else if(!addOns){
//       throw new Error("No AddOn Found!!");
//     }
//     await new UserService().updateUser({_id: bookingData.userId},
//       {
//         bookingStatus:     bookingData.bookingStatus,
//         bookingId:         bookingData.bookingId,
//         bookingIdProvider: bookingData.bookingIdProvider,
//       });
//     logger.info("User Updated Successfully!");
//   } catch(error){
//     throw new Error("Unhandled error", error);
//   }
// }

// updateUserBookingsQueue.process(async(job)=>{
//   try {
//     const bookingData = job.data;
//     logger.info(`Procesing job for ${bookingData.bookingId}...`);
//     const addOns      = await client.hgetall(`${bookingData.userId}:addons`);
//     if(addOns){
//           logger.info(`AddOns Fetched from Redis ${addOns}`);
//           try{
//             await new BookingService().updateBookings({_id: bookingData.bookingId}, {addOns});
//             logger.info('Bookings Updated Successfully!');
//           } catch(error){
//             logger.error('Bookings Failed to Update!');
//           }
//         } else if(!addOns){
//           throw new Error("No AddOn Found!!");
//         }
//         await new UserService().updateUser({_id: bookingData.userId},
//                 {
//                   bookingStatus:     bookingData.bookingStatus,
//                   bookingId:         bookingData.bookingId,
//                   bookingIdProvider: bookingData.bookingIdProvider,
//                 });
//               logger.info("User Updated Successfully!");
//   } catch (error) {
//     throw new Error("Unhandled error", error);
//   }

// });

// const handleCompleted = job => {
//   logger.info(
//     `Job in ${job.queue.name} completed for: ${JSON.stringify(job.data)}`
//   );
//   job.remove();
// };

// const handleStalled = job => {
//   logger.info(
//     `Job in ${job.queue.name} stalled for: ${JSON.stringify(job.data)}`
//   );
// };

// const handleFailure = (job, err) => {
//   if(job.attemptsMade >= job.opts.attempts){
//     logger.info(
//       `Job failures above threshold in ${job.queue.name} for: ${JSON.stringify(
//         job.data
//       )}`,
//       err
//     );
//     job.remove();
//     return null;
//   }
//   logger.info(
//     `Job in ${job.queue.name} failed for: ${JSON.stringify(job.data)} with ${
//       err.message
//     }. ${job.opts.attempts - job.attemptsMade} attempts left`
//   );
// };

// updateUserBookingsQueue.on("failed", handleFailure);
// updateUserBookingsQueue.on("completed", handleCompleted);
// updateUserBookingsQueue.on("stalled", handleStalled);