const Joi = require("joi");

const contactUsSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds:              { allow: [ "com", "net" ] },
  }),
  name:        Joi.string().required(),
  message:     Joi.string().required(),
  phoneNumber: Joi.string().required()
});

module.exports = contactUsSchema;