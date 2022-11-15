const logger         = require('../lib/logger');
const Response       = require('../commons/responses');
const httpCode       = require('../commons/httpCode');
const PaymentService = require('../services/payment');
const Sentry         = require("../lib/sentry");

class Payment extends PaymentService{
  async initiatePayments(req, res){
    try{
      let paymentDetails      = req.body;
      const { email, amount } = paymentDetails;
      const userId            = req.user.id;
      const result            = await this.initiatePayment(paymentDetails);

      if(result.data.status === true){
        const paymentPayload = {
          email,
          userId,
          transactionRef: result.data.data.reference,
          amount:         Number(amount) * 100
        }
        // collect metaData(booking details of the user including the first and lastname of the user)
        const savedPayment   = await this.addPaymentDetails(paymentPayload);
        if(savedPayment){
          logger.info('Successfully Saved PaymentDetails');
          return Response.success(res, {
            response: {
              redirect_url: result.data.data.authorization_url
            },
            message: 'Transaction Successfully Initiated'  },
          httpCode.ACCEPTED);
        }
        else {
          logger.error('Failed to Save Payment Initiaition Data');
          return Response.failure(res, {response: {}, message: "Unexpected Error Occured"}, httpCode.NOT_IMPLEMENTED)
        }
      }
      else {
        return Response.failure(res,  {
          response: {},
          message:  'Failed to Initiate Transaction' },
        httpCode.UNPROCESSED_ENTITY);
      }
    } catch(error){
      logger.error(`Payment initiation Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Payment initiation Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

}
module.exports = new Payment()