const Joi = require("joi");

const visaAssistanceSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds:              { allow: [ "com", "net" ] },
  }),
  surname:            Joi.string().required(),
  firstName:          Joi.string().required(),
  phoneNumber:        Joi.string().required(),
  depatureDate:       Joi.string().required(),
  returnDate:         Joi.string().required(),
  passportNo:         Joi.string().required(),
  countryOfResidence: Joi.string().required(),
  destinationCountry: Joi.string().required(),
  message:            Joi.string().required(),
});

module.exports = visaAssistanceSchema;