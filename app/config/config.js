/* eslint-disable no-undef */
const appName = "Geo Travels";

const config   = {
  appName,
  appBaseUrl: process.env.APP_BASE_URL || "https://geo-travel-api.herokuapp.com",
  clientUrl:  process.env.CLIENT_BASE_URL || "https://geo2-pearl.vercel.app/",
  port:       process.env.PORT || 4900,
  queryLimit: 5,
  test:       {
    dbUrl: "mongodb://127.0.0.1:27017/geotravels",
  },
  dbUrl:     process.env.DB_URL,
  nodeEnv:   process.env.NODE_ENV,
  outputDir: `${__dirname.replace("app/config", "logs")}/`,
  mongo:     {
    collections: {
      users:        process.env.USERS || "users",
      tokens:       'tokens',
      airports:     'airports',
      airlines:     'airlines',
      bookings:     'bookings',
      payments:     'payments',
      contactList:  'contactlists',
      packages:     'packages',
      reservation:  'reservations',
      grandSums:    'grandSums',
      visaRequests: 'visaRequests'
    },
  },
  jwt: {
    passSecret: process.env.PASS_SECRET,
    secret:     process.env.JWT_SECRET,
  },
  gmail: {
    mail: process.env.GMAIL,
    pass: process.env.GMAIL_PASS
  },
  mailgun: {
    apiKey:  process.env.MAILGUN_API_KEY,
    domain:  process.env.MAILGUN_DOMAIN,
    address: process.env.MAIL_ADDRESS,
  },
  s3: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.SECRET_KEY,
    region:    "us-east-1",
    bucket:    process.env.S3_BUCKET
  },
  sentryDSN:       process.env.SENTRY_DSN,
  paystackDetails: {
    apiKey:      process.env.PAYSTACK_SECRET_KEY,
    initiateUrl: process.env.PAYSTACK_INITIATE_URL,
    verifyUrl:   process.env.PAYSTACK_VERIFY_URL,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL
  },
  mailchimp: {
    event:             process.env.EVENT_NAME,
    footerContactInfo: {
      company:  process.env.COMPANY,
      address1: process.env.ADDRESS,
      address2: "PLOT 2B",
      city:     process.env.CITY,
      state:    process.env.STATE,
      zip:      process.env.ZIP,
      country:  process.env.COUNTRIES
    },
    campaignDefaults: {
      from_name:  "Geo Travels",
      from_email: process.env.FROM_EMAIL,
      subject:    "Geo travels Updates",
      language:   process.env.LANGUAGE
    }
  }
};

module.exports = config;
