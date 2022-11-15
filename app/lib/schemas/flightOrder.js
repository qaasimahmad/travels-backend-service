const Joi = require("joi");

const flightOfferSchema = Joi.object({
  data: Joi.object({
    flightOffers: Joi.array().items({
      type:                     Joi.string().required(),
      id:                       Joi.string().required(),
      source:                   Joi.string().required(),
      instantTicketingRequired: Joi.boolean(),
      nonHomogeneous:           Joi.boolean(),
      paymentCardRequired:      Joi.boolean(),
      lastTicketingDate:        Joi.string(),
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
      price: Joi.object({
        currency: Joi.string().required(),
        total:    Joi.string(),
        base:     Joi.string(),
        fees:     Joi.array().items({
          amount: Joi.string(),
          type:   Joi.string()
        }).required(),
        grandTotal:      Joi.string(),
        billingCurrency: Joi.string()
      }).required(),
      pricingOptions: Joi.object({
        fareType:                Joi.array().length(1),
        includedCheckedBagsOnly: Joi.boolean()
      }).required(),
      validatingAirlineCodes: Joi.array().length(1),
      travelerPricings:       Joi.array().items({
        travelerId:   Joi.string(),
        fareOption:   Joi.string(),
        travelerType: Joi.string(),
        price:        Joi.object({
          currency: Joi.string(),
          total:    Joi.string(),
          base:     Joi.string(),
          taxes:    Joi.array().items({
            amount: Joi.string(),
            code:   Joi.string()
          }).required(),
          refundableTaxes: Joi.string()
        }).required(),
        fareDetailsBySegment: Joi.array().items({
          segmentId:           Joi.string(),
          cabin:               Joi.string(),
          fareBasis:           Joi.string(),
          class:               Joi.string(),
          includedCheckedBags: Joi.object({
            weight:     Joi.number().integer(),
            weightUnit: Joi.string()
          }),
          brandedFare: Joi.string()
        }).required()
      })
    }).required(),
    travelers: Joi.array().items({
      id:          Joi.string(),
      dateOfBirth: Joi.string(),
      name:        Joi.object({
        firstName: Joi.string(),
        lastName:  Joi.string()
      }),
      gender:  Joi.string(),
      contact: Joi.object({
        emailAddress: Joi.string(),
        phones:       Joi.array().items({
          deviceType:         Joi.string(),
          countryCallingCode: Joi.string(),
          number:             Joi.string()
        })
      }).required(),
      documents: Joi.array().items({
        documentType:     Joi.string(),
        birthPlace:       Joi.string(),
        issuanceLocation: Joi.string(),
        issuanceDate:     Joi.string(),
        number:           Joi.string(),
        expiryDate:       Joi.string(),
        issuanceCountry:  Joi.string(),
        validityCountry:  Joi.string(),
        nationality:      Joi.string(),
        holder:           Joi.boolean()
      })
    }).required(),
    billingDetails: Joi.array().items({
      state:    Joi.string().required(),
      country:  Joi.string().required(),
      city:     Joi.string().required(),
      address1: Joi.string(),
      zipCode:  Joi.string(),
      address2: Joi.string(),
    }).required(),
    bookingRequirements: Joi.object(),
    meta:                Joi.object(),
    info:                Joi.array()
  })
})

module.exports = flightOfferSchema;