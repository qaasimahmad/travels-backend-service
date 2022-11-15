const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().required(),
  email:    Joi.string().email({ minDomainSegments: 2, tlds: { allow: [ 'com', 'net' ] } }),
  password: Joi.string().required(),
});

module.exports = userSchema;