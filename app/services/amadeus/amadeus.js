let Amadeus  = require("amadeus");
const dotenv = require('dotenv');

dotenv.config();

let amadeus = new Amadeus({
  clientId:     process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_SECRET
});

module.exports = amadeus;
