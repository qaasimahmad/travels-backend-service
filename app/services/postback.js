const PaymentService = require('../services/payment');
const externalCall   = require('../lib/externalCallHandler');
const UserService    = require("../services/users");
const BookingService = require("../services/bookings");
// const audit_trail_service = require('./admin');
const config                   = require('../config/config');
const paystackSecretKey        = config.paystackDetails.apiKey;
const paystackVerifyPaymentUrl = config.paystackDetails.verifyUrl;
const logger                   = require('../lib/logger');

class PostbackService extends PaymentService{

  async PostbackService({transactionRef}){
    try{

      const options          = {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        }
      }
      const verifyPaymentUrl = `${paystackVerifyPaymentUrl}/${transactionRef}`;

      const returnedData    = await externalCall.customGetRequest(verifyPaymentUrl, options);
      const paymentResponse = returnedData?.data?.data;

      if(returnedData.data.status === true && paymentResponse.status === "success"){
        const updatedPayment = await this.updatePaymentDetails({transactionRef}, {status: "paid"});

        logger.info("Payment Updated ✔");
        if(updatedPayment){
          const user           = await new UserService().getSingleUserDetails({_id: updatedPayment.userId});
          const bookingDetails = await new BookingService().getSingleBookingDetails({userId: user._id})

          logger.info(`User Fetched ✔`);
          if(user){
            const firstName =  bookingDetails?.travelers[ 0 ]?.name?.firstName || user.username;
            const lastName  =   bookingDetails?.travelers[ 0 ]?.name?.lastName  || user.username;
            const fullname  = `${firstName} ${lastName}`;

            return {
              status:          paymentResponse.status,
              name:            fullname,
              geoBookingId:    bookingDetails._id,
              bookingRefAlt:   bookingDetails.bookingIdProvider,
              bookingRef:      bookingDetails.bookingProviderRef,     
              message:         "Payment processed Successfully!",
              email:           user.email,
              currency:        paymentResponse.currency,
              channel:         paymentResponse.channel,
              reference:       paymentResponse.reference,
              transactionDate: paymentResponse.transaction_date,
              amount:          updatedPayment.amount/100
            }
          } else {
            logger.info("User Not Found! ✖");
          }

        } else {
          logger.info("Failed To Update Payment Data ✖");
        }
      } else {
        return {
          status:          paymentResponse.status,
          name:            null,
          message:         "Payment Processing Failed!",
          email:           null,
          currency:        paymentResponse.currency,
          channel:         paymentResponse.channel,
          reference:       paymentResponse.reference,
          transactionDate: returnedData?.transaction_date,
          amount:          Number(paymentResponse.amount)/100
        }
      }
    } catch(error){
      return false;
    }
  }
}
module.exports = PostbackService;