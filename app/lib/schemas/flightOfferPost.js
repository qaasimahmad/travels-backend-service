const Joi = require("joi");

const flightOffersSchemaPost = Joi.object({
  currencyCode:       Joi.string().required(),
  originDestinations: Joi.array().items({
    id:                      Joi.string().required(),
    originLocationCode:      Joi.string().required(),
    destinationLocationCode: Joi.string().required(),
    departureDateTimeRange:  Joi.object({
      date: Joi.string().required(),
      time: Joi.string().required()
    })
  }),
  travelers: Joi.array().items({
    id:           Joi.string().required(),
    travelerType: Joi.string().required(),
    fareOptions:  Joi.array().items(Joi.string()).required()
  }).required(),
  sources:        Joi.array().items(Joi.string()).length(1),
  searchCriteria: Joi.object({
    maxFlightOffers: Joi.number().integer(),
    flightFilters:   Joi.object({
      cabinRestrictions: Joi.array().items({
        cabin:                Joi.string().required(),
        coverage:             Joi.string(),
        originDestinationIds: Joi.array().items(Joi.string()).length(1).required()
      }).required(),
      carrierRestrictions: Joi.object({
        excludedCarrierCodes: Joi.array(),
        includedCarrierCodes: Joi.array()
      })
    }),
    nonStop: Joi.boolean()
  }),
  filters: Joi.object(),
  sort:    Joi.string()
})

module.exports = flightOffersSchemaPost;
