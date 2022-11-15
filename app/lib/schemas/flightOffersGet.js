const Joi = require("joi");

const flightOffersSchemaGet = Joi.object({
  originLocationCode:      Joi.string().required(),
  destinationLocationCode: Joi.string().required(),
  departureDate:           Joi.string().required(),
  returnDate:              Joi.string(),
  adults:                  Joi.number().required(),
  children:                Joi.number().integer(),
  infants:                 Joi.number().integer(),
  travelClass:             Joi.string(),
  includedAirlineCodes:    Joi.string(),
  excludedAirlineCodes:    Joi.string(),
  nonStop:                 Joi.boolean(),
  currencyCode:            Joi.string(),
  maxPrice:                Joi.number().integer(),
  max:                     Joi.number().integer(),
  stops:                   Joi.string(),
  sort:                    Joi.string()
});

module.exports = flightOffersSchemaGet;