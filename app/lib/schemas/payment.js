const Joi = require("joi");

const paymentSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds:              { allow: [ "com", "net" ] },
  }).required(),
  amount: Joi.number().required()
});

module.exports = paymentSchema;