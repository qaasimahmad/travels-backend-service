const Token                           = require("../models/token");
const UserService                     = require("./users");
const utils                           = require("../lib/utils");
const crypto                          = require('crypto');
const logger                          = require("../lib/logger");
const {clientUrl}                     = require("../config/config");
const {mailSubjects:{
  resetPasswordRequest,
  successfulPasswordReset}}           = require("../lib/mailSubjects");
const passwordRequestTemplate         = require("../commons/onPasswordResetRequest");
const successfulPasswordResetTemplate = require("../commons/onSuccessfulPassordReset");

class PasswordReset extends UserService{
  async requestPasswordReset(email){
    const user = await new UserService().getSingleUserDetails({ email });

    if(!user){
      throw new Error("user does not Exist")
    }
    let token = await Token.findOne({ userId: user._id });

    if(token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex")
    let hash       = utils.encryptPassword(resetToken, process.env.RESET_SECRET);

    await new Token({
      userId:    user._id,
      token:     hash,
      createdAt: Date.now(),
    }).save();

    // TODO: Change this appBaseUrl to the clientUrl once it is ready on the FrontEnd.
    const link = `${clientUrl}/passwordReset?token=${resetToken}&id=${user._id}`;

    await new PasswordReset().prepareResetPasswordMailAndSend(user, resetPasswordRequest, link);
    return true
  }

  async resetPassword(userId, tokenPassed, password){
    let tokenDetails = await Token.findOne({ userId });

    if(!tokenDetails){
      throw new Error("Invalid or expired password reset token");
    }
    let orginalToken = utils.decryptPassword(tokenDetails.token, process.env.RESET_SECRET);

    if(tokenPassed === orginalToken){
      const newHash     = utils.encryptPassword(password, process.env.PASS_SECRET);

      await new UserService().updateUser({_id: userId}, {password: newHash});
      const user = await new UserService().getSingleUserDetails({ _id: userId });

      await new PasswordReset().preparePasswordResetSuccessMailAndSend(user, successfulPasswordReset);
      await tokenDetails.deleteOne();
      return true;
    }
  }

  async prepareResetPasswordMailAndSend(userDetails, mailSubject, link){
    const userMailPayload = {
      from:    process.env.MAIL_ADDRESS,
      to:      userDetails.email,
      subject: mailSubject,
      html:    passwordRequestTemplate.mailBody({
        user: [ userDetails, link ],
      }),
    };

    try{
      await utils.sendMailNotification(userMailPayload);
      logger.info("Mail Sent Successfully");
    } catch(error){
      logger.error(`Mail Failed to Send ${error}`);
    }
  }

  async preparePasswordResetSuccessMailAndSend(userDetails, mailSubject){
    const userMailPayload = {
      from:    process.env.MAIL_ADDRESS,
      to:      userDetails.email,
      subject: mailSubject,
      html:    successfulPasswordResetTemplate.mailBody({
        user: userDetails,
      }),
    };

    try{
      await utils.sendMailNotification(userMailPayload);
      logger.info("Mail Sent Successfully");
    } catch(error){
      logger.error(`Mail Failed to Send ${error}`);
    }
  }
}
module.exports = new PasswordReset();