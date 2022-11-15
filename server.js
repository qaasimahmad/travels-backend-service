require("dotenv").config();
const Sentry = require("@sentry/node");
let throng   = require('throng');

process.env.NODE_ENV === "test" ? (process.env.NODE_ENV = "dev") : "dev";

const app    = require("./app/app");
const logger = require("./app/lib/logger");
const config = require("./app/config/config");

Sentry.init({
  dsn: config.sentryDSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

function start(){
  app.listen(process.env.PORT || 4900, () =>
    logger.info(`${config.appName} is listening on port ${config.port}`)
  );

}
// module.exports = app.listen(process.env.PORT || 4900, () =>
//   logger.info(`${config.appName} is listening on port ${config.port}`)
// );
throng({workers: 1, start})
