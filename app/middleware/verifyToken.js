const jwt         = require("jsonwebtoken");
const jwtSecret   = process.env.JWT_SECRET;
const Response    = require("../commons/responses");
const httpStatus  = require("../commons/httpCode");
const verifyToken = (req, res, next) => {
  let tokenPassed = req.headers.token;
  if(tokenPassed){
    tokenPassed       = tokenPassed.split(" ");
    const [ , token ] = tokenPassed;

    jwt.verify(token, jwtSecret, (err, user) => {
      if(err)
        return Response.failure(
          res,
          {response: {}, message: "Token is invalid!"},
          httpStatus.UNAUTHORIZED
        );
      req.user = user;
      next();
    });
  } else {
    return Response.failure(
      res,
      {response: {}, message: "Missing Token in headers"},
      httpStatus.BAD_REQUEST
    );
  }
};

const verifyTokenAndAuthorize = (req, res, next) => {
  verifyToken(req, res, () => {
    if(req.user.id === req.params.id || req.user.isAdmin){
      next();
    } else {
      return Response.failure(res, {response: {}, message: "You are not Allowed to perform this Action!"},
        httpStatus.FORBIDDEN)
    }
  });
};

const verifyTokenAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if(req.user.isAdmin){
      next();
    } else {
      return Response.failure(res, {response: {}, message: "You are not Allowed to perform this Action!"},
        httpStatus.FORBIDDEN)
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthorize, verifyTokenAdmin };
