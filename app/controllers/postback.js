require('dotenv').config();
const logger          = require('../lib/logger');
const PostbackService = require('../services/postback');
const UserService     = require("../services/users");
const Response        = require('../commons/responses');
const httpCode        = require('../commons/httpCode');
const Sentry          = require("../lib/sentry");
const clientBaseUrl   = process.env.CLIENT_BASE_URL;


class Postback extends PostbackService{
  async verifyPayment(req, res){
    try{
      const {reference}         = req.query;

      await this.getSinglePaymentDetails({transactionRef: reference});
      const paymentVerification = await this.PostbackService({transactionRef: reference});

      if(paymentVerification.status === "success"){
        const final_data = {
          status:         paymentVerification.status,
          message:        "Payment Processed Successfully",
          amount:         paymentVerification.amount,
          transactionRef: paymentVerification.reference,
          currency:       paymentVerification.currency,
          timestamp:      paymentVerification.transactionDate,
          mode:           paymentVerification.channel,
          username:       paymentVerification.name,
          geobookingRef:  paymentVerification.geoBookingId,
          bookingRefAlt:  paymentVerification.bookingRefAlt,
          bookingRef:     paymentVerification.bookingRef,
          email:          paymentVerification.email
        }


        // eslint-disable-next-line max-len
        const redirectUrl = `${clientBaseUrl}flight/book-flight/confirmation?status=${final_data.status}&message=${final_data.message}&ref=${final_data.message}&name=${final_data.username}&bookingId=${final_data.bookingId}&ticketNo=None`;

        logger.info(`redirecting ...${redirectUrl}`);
        try{
          const userDetails = {
            username:      final_data.username, email:         final_data.email,
            amount:        final_data.amount, bookingId:     final_data.bookingId,
            geoBookingRef: final_data.geobookingRef,
            ref:           final_data.bookingRef,
            bookingRef:    final_data.bookingRefAlt,
          }

          await new UserService().prepareNotifyPaymentStatusMailAndSend(userDetails);
          const adminDetails = {
            email:       userDetails.email,
            action:      'Successful Booking',
            description: 'None'
          }

          await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
          logger.info(`Booking Mail Sent Successfully ✔`);
        } catch(error){
          logger.error(`Booking Mail Failed to Send ✖ ${error}`);
        }

        return res.redirect(redirectUrl);
      } else {
        const final_data = {
          status:         paymentVerification.status,
          message:        "Payment processing Failed!",
          amount:         paymentVerification.amount,
          transactionRef: reference,
          currency:       paymentVerification.currency,
          timestamp:      paymentVerification.transactionDate,
          mode:           paymentVerification.channel
        }

        // eslint-disable-next-line max-len
        const redirectUrl = `${clientBaseUrl}flight/book-flight/confirmation?status=${final_data.status}&message=${final_data.message}`;

        logger.info(`Redirecting ... ${redirectUrl}`);

        return res.redirect(redirectUrl);
      }
    } catch(error){
      logger.error(`Payment Verification Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Payment Verification Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

}
module.exports = new Postback()