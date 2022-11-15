const Response               = require("../commons/responses");
const httpCode               = require("../commons/httpCode");
const UserService            = require("../services/users");
const {requestPasswordReset} = require('../services/passwordReset');
const {resetPassword}        = require('../services/passwordReset');
const Sentry                 = require("../lib/sentry");

class VerifyUser extends UserService{
  async verifyUser(req, res){
    const {confirmationCode} = req.params;

    try{
      const user = await this.getSingleUserDetails({confirmationCode});
      if(user){
        user.status       = "Active"
        const updatedUser = await this.addUser(user)
        const response    = {
          _id:       updatedUser._id,
          username:  updatedUser.username,
          email:     updatedUser.email,
          status:    updatedUser.status,
          isAdmin:   updatedUser.isAdmin,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }

        if(updatedUser){
          return Response.success(res, {response, message: 'Veification Succesful'}, httpCode.OK)
        }
      }
      return Response.failure(res, {response: {}}, httpCode.NOT_FOUND);
    } catch(error){
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Verify User Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async requestPasswordReset(req, res){
    try{
      const requestPasswordResetService = await requestPasswordReset(req.body.email);
      if(requestPasswordResetService){
        return Response.success(res, {response: {}, message: "Request for password Reset sent! "}, httpCode.ACCEPTED)
      }
    } catch(error){
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Password Reset Request Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async resetPassword(req, res){
    try{
      const resetPasswordService = await resetPassword(
        req.body.userId,
        req.body.token,
        req.body.password);
      if(resetPasswordService){
        return Response.success(res, {response: {}, message: "password Successfully Reset"}, httpCode.OK)
      }
    } catch(error){
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Password Reset Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

}
module.exports = new VerifyUser();