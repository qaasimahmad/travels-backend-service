const MongoDBHelper         = require('.');
const logger                = require('../lib/logger');
const PaymentModel          = require('../models/payments');
const external_call         = require('../lib/externalCallHandler');
const paystack_initiate_url = process.env.PAYSTACK_INITIATE_URL;
const paystack_api_key      = process.env.PAYSTACK_SECRET_KEY;
const paystack_callback_url = process.env.PAYSTACK_CALLBACK_URL;

class PaymentService{
  constructor(){
    this.mongoPayment = new MongoDBHelper(PaymentModel);
  }

  async initiatePayment(paymentParams){
    paymentParams.callback_url = `${paystack_callback_url}`
    const options              = {
      headers: {
        Authorization: `Bearer ${paystack_api_key}`,
      }
    }
    const data                 = paymentParams
    const url                  = `${paystack_initiate_url}/initialize`;

    return await external_call.customPostRequest(url, data, options);
  }

  async addPaymentDetails(data){
    logger.info(`Adding PaymentDetails.. ${JSON.stringify(data)}`);
    return this.mongoPayment.save(data);
  }

  async getAllPaymentDetails(param){
    logger.info('getAllPaymentDetails...', param);
    return this.mongoPayment.getBulk(param);
  }

  async getSinglePaymentDetails(param){
    logger.info(`getSinglePaymentDetails... ${param}`);
    return this.mongoPayment.get(param);
  }
  async updatePaymentDetails(param, data){
    logger.info('UpdatePaymentDetails', param);
    return this.mongoPayment.update(param, data);
  }
  async checkPaymentStatus(param){
    logger.info('checkPaymentDetails', param);
    return this.mongoPayment.get(param);
  }
}
module.exports = PaymentService