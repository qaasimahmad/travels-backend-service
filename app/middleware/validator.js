const logger   = require('../lib/logger');
const Response = require("../commons/responses");
const httpCode = require("../commons/httpCode");

const middleware = (schema) => {
  return (req, res, next) => {
    const { error } = (JSON.stringify(req.body) === '{}' && JSON.stringify(req.query) != '{}')
      ? schema.validate(req.query)
      : schema.validate(req.body);
    const valid     = error == null;

    if(valid){
      next();
    } else {
      const { details } = error;
      const message     = details.map((i) => i.message).join(",");

      logger.info("error", message);
      return Response.failure(res, {response: {}, message }, httpCode.UNPROCESSED_ENTITY);
    }
  };
};

module.exports   = middleware;
