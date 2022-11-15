const Joi = require("joi");

const packageSchema = Joi.object({
  name:    Joi.string().required(),
  caption: Joi.string().required(),
  content: Joi.array().items({
    TandC:       Joi.string().required(),
    description: Joi.string().required(),
    summary:     Joi.string().required()
  }),
  photos:        Joi.array(),
  from:          Joi.string().required(),
  to:            Joi.string().required(),
  price:         Joi.string().required(),
  endDate:       Joi.string().required(),
  passengerType: Joi.array().items({
    adults:   Joi.number(),
    children: Joi.number(),
    infants:  Joi.number()
  }).required()
});

module.exports = packageSchema;