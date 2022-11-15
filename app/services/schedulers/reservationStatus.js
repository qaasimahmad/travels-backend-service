const nodeCron                = require("node-cron");
const updateReservationStatus = require("../jobs/updateReservation");
const logger                  = require("../../lib/logger");


nodeCron.schedule("20 * * * * *", async() => {
  await updateReservationStatus();
  logger.info("Done! 😎 ");
});