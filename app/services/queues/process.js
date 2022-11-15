// require("dotenv").config();
// let throng = require('throng');

// // increase the max listeners to get rid of the warning below
// // MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
// // 11 global:completed listeners added. Use emitter.setMaxListeners() to increase limit
// const EventEmitter               = require("events");

// EventEmitter.defaultMaxListeners = 50;

// // the processor to define/link
// const updateBookingProcessor = require("../consumers/updateBookingProcessor");
// // the producer
// const { updateUserBookingsQueue } = require(".");

// const logger = require("../../lib/logger");

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

// const activeQueues = [
//   {
//     queue:     updateUserBookingsQueue,
//     processor: updateBookingProcessor
//   }
// ];
// function start(){
//   activeQueues.forEach(handler => {
//     const queue     = handler.queue;
//     const processor = handler.processor;

//     const failHandler      = handler.failHandler || handleFailure;
//     const completedHandler = handler.completedHandler || handleCompleted;

//     // here are samples of listener events : "failed","completed","stalled", the other events will be ignored
//     queue.on("failed", failHandler);
//     queue.on("completed", completedHandler);
//     queue.on("stalled", handleStalled);
//     queue.process(processor);// link the correspondant processor/worker

//     logger.info(`Processing ${queue.name}... Press [ctrl C] to Cancel`);
//   });
// }
// throng({workers: 1, start});
