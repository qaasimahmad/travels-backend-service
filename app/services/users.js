const MongoDBHelper                             = require(".");
const logger                                    = require("../lib/logger");
const UserModel                                 = require("../models/users");
const welcomeTemplate                           = require("../commons/onSignUp");
const paymentStatusTemplate                     = require("../commons/paymentStatus");
const reservationStatusTemplate                 = require("../commons/reservationStatus");
const adminNotificationTemplate                 = require("../commons/adminNotification");
const { mailSubjects:{successfulPayment} }      = require("../lib/mailSubjects");
const { mailSubjects:{successfullReservation} } = require("../lib/mailSubjects");


require("dotenv").config();

const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

class UserService{
  constructor(){
    this.mongoUser = new MongoDBHelper(UserModel);
  }

  async addUser(data){
    logger.info(`Adding new User...`);
    return this.mongoUser.save(data);
  }
  async getSingleUserDetails(param){
    logger.info(`getSingleUserDetails...${param}`);
    return this.mongoUser.getUser(param);
  }
  async getAllUserDetails(param){
    logger.info(`getAllUsersDetails... ${param}`);
    return this.mongoUser.getBulkUsers(param);
  }
  async getAllUsersDetailsPaginated(param){
    logger.info(`getPaginatedUsers... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }

  async prepareMailAndSend(userDetails, mailSubject, confirmationToken, subscriptionId){
    const userMailPayload = {
      from:    process.env.MAIL_ADDRESS,
      to:      userDetails.email,
      subject: mailSubject,
      html:    welcomeTemplate.mailBody({
        user: [ userDetails, confirmationToken, subscriptionId ],
      }),
    };

    try{
      await this.sendMailNotification(userMailPayload);
      logger.info("Mail Sent Successfully");
    } catch(error){
      logger.error(`Mail Failed to Send ${error}`);
    }
  }

  async prepareContactUsMailAndSend(userDetails){
    const userMailPayload = {
      from:    process.env.CONTACT_US_MAIL,
      to:      process.env.CONTACT_RECEPIENT_MAIL,
      subject: `${userDetails.name.toUpperCase()} has this to say`,
      html:    `<p>
          ${userDetails.email} dropped this message below <br>
          ${userDetails.message}<br>
      </p>`,
    };

    try{
      await this.sendMailNotification(userMailPayload);
      logger.info("Mail Sent Successfully");
    } catch(error){
      logger.error(`Mail Failed to Send ${error}`);
    }
  }

  async prepareNotifyPaymentStatusMailAndSend(userDetails){
    const userMailPayload = {
      from:    process.env.MAIL_ADDRESS,
      to:      userDetails.email,
      subject: successfulPayment,
      html:    paymentStatusTemplate.mailBody({
        user: userDetails
      }),
    };

    try{
      await this.sendMailNotification(userMailPayload);
      logger.info("Sending booking Mail..");
    } catch(error){
      logger.error(`Sending booking Mail Failed! ${error}`);
    }
  }

  async prepareNotifyReservationStatusMailAndSend(reservationDetails){
    const userMailPayload = {
      from:    process.env.MAIL_ADDRESS,
      to:      reservationDetails.email,
      subject: successfullReservation,
      html:    reservationStatusTemplate.mailBody({
        user: reservationDetails
      }),
    };

    try{
      await this.sendMailNotification(userMailPayload);
      logger.info("Sending booking Mail..");
    } catch(error){
      logger.error(`Sending booking Mail Failed! ${error}`);
    }
  }

  async prepareAdminNotificationMailAndSend(mailDetails){
    const userMailPayload = {
      from:    process.env.CONTACT_US_MAIL,
      to:      process.env.ADMIN_EMAIL_NOTIF,
      subject: mailDetails.action,
      html:    adminNotificationTemplate.mailBody({
        user: mailDetails
      }),
    };

    try{
      await this.sendMailNotification(userMailPayload);
      logger.info("Sending Admin Mail..");
    } catch(error){
      logger.error(`Sending Admin Mail Failed! ${error}`);
    }
  }

  async updateUser(params, data){
    logger.info("Updating User..");
    return this.mongoUser.update(params, data);
  }
  async updateUsersFlightPackages(params, data){
    logger.info("Updating User FligtPackage..");
    return this.mongoUser.updateUsersFlightPackages(params, data);
  }

  async deleteUser(params){
    logger.info("Deleting User..");
    return this.mongoUser.deleteOne(params)
  }

  async sendMailNotification(payload){
    return new Promise((resolve, reject) => {
      mailgun.messages().send(payload, (error, body) => {
        if(error){
          return reject(error);
        } else {
          return resolve(body);
        }
      });
    });
  }
}
module.exports = UserService;
