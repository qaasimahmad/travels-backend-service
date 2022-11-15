const MongoDBHelper     = require(".");
const logger            = require("../lib/logger");
const VisaRequestsModel = require("../models/visaRequests");
const utils             = require("../lib/utils");
const moment            = require('moment');

class VisaAssistanceRequestService{
  constructor(){
    this.mongoUser = new MongoDBHelper(VisaRequestsModel);
  }

  async addVisaRequest(data){
    logger.info(`Adding new VisaRequest...`);
    return this.mongoUser.save(data);
  }
  async getSingleVisaRequestDetails(param){
    logger.info(`getSingleVisaRequestDetails...${param}`);
    return this.mongoUser.get(param);
  }
  async getAllVisaRequestDetails(param){
    logger.info(`getAllVisaRequestDetails... ${param}`);
    return this.mongoUser.getBulk(param);
  }
  async getAllVisaRequestByDate(param){
    if(param.date){
      const amount = utils.getAmountToRemoveFromDate(param.date);

      logger.info(`getVisaRequestDetailsByDate... ${JSON.stringify(amount)}`);
      return this.mongoUser.getBulkByDate(amount);
    }
    if(param.dateRange){
      const startDate = moment(param.dateRange[ 0 ]).format("YYYY-MM-DD");
      const endDate   = moment(param.dateRange[ 1 ]).format("YYYY-MM-DD");

      return this.mongoUser.getBulkByDate({dateRange: [ startDate, endDate ]});
    }
  }
  async getAllVisaRequestPaginated(param){
    logger.info(`getPaginatedVisaRequest... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }

  async updateVisaRequest(params, data){
    logger.info("Updating VisaRequest..");
    return this.mongoUser.update(params, data)
  }

  async deleteVisaRequest(params){
    logger.info("Deleting VisaRequest..");
    return this.mongoUser.deleteOne(params)
  }

}
module.exports = VisaAssistanceRequestService;