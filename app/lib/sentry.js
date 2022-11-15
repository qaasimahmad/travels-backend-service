const Sentry = require("@sentry/node");
const config = require("../config/config");

Sentry.init({
  dsn: config.sentryDSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
