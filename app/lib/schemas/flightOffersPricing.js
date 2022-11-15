const Joi = require("joi");

const flightOffersPricingSchema = Joi.object({
  data: Joi.object({
    flightOffers: Joi.array().items({
      type:                     Joi.string().equal("flight-offer").required(),
      id:                       Joi.string(),
      source:                   Joi.string().required(),
      instantTicketingRequired: Joi.boolean(),
      nonHomogeneous:           Joi.boolean(),
      paymentCardRequired:      Joi.boolean(),
      oneWay:                   Joi.boolean(),
      lastTicketingDate:        Joi.string(),
      numberOfBookableSeats:    Joi.number(),
      itineraries:              Joi.array().items({
        duration: Joi.string(),
        segments: Joi.array().items({
          departure: Joi.object({
            iataCode: Joi.string(),
            terminal: Joi.string(),
            at:       Joi.string(),
          }),
          arrival: Joi.object({
            iataCode: Joi.string(),
            terminal: Joi.string(),
            at:       Joi.string(),
          }),
          carrierCode: Joi.string(),
          number:      Joi.string(),
          aircraft:    Joi.object({
            code: Joi.string()
          }),
          operating: Joi.object({
            carrierCode: Joi.string()
          }),
          duration:        Joi.string(),
          id:              Joi.string(),
          numberOfStops:   Joi.number(),
          blacklistedInEU: Joi.boolean(),
          co2Emissions:    Joi.array()
        })

      }).required(),
      price:                  Joi.object().required(),
      pricingOptions:         Joi.object().required(),
      validatingAirlineCodes: Joi.array().required(),
      travelerPricings:       Joi.array().required()
    }),
    addOn: Joi.object()
  }),

})

module.exports = flightOffersPricingSchema;