const Joi = require("joi");

const reservationSchema = Joi.object({
  flightPackageId: Joi.string().required(),
  email:           Joi.string().email({
    minDomainSegments: 2,
    tlds:              { allow: [ "com", "net" ] },
  }),
  surname:       Joi.string().required(),
  firstName:     Joi.string().required(),
  middleName:    Joi.string(),
  phoneNumber:   Joi.string().required(),
  from:          Joi.string().required(),
  to:            Joi.string().required(),
  returnDate:    Joi.string().required(),
  passengerType: Joi.array().required()
});

module.exports = reservationSchema;