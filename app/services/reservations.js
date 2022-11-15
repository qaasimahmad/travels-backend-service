const MongoDBHelper    = require(".");
const logger           = require("../lib/logger");
const ReservationModel = require("../models/reservations");
const utils            = require("../lib/utils");
const moment           = require('moment');

class ReservationService{
  constructor(){
    this.mongoUser = new MongoDBHelper(ReservationModel);
  }

  async addReservation(data){
    logger.info(`Adding new Reservation...`);
    return this.mongoUser.save(data);
  }
  async getSingleReservationDetails(param){
    logger.info(`getSingleReservationDetails...${param}`);
    return this.mongoUser.get(param);
  }
  async getAllReservationDetails(param){
    logger.info(`getAllReservationDetails... ${param}`);
    return this.mongoUser.getBulk(param);
  }
  async getAllReservationsDetailsByDate(param){
    if(param.date){
      const amount = utils.getAmountToRemoveFromDate(param.date);

      logger.info(`getReservationsDetailsByDate... ${JSON.stringify(amount)}`);
      return this.mongoUser.getBulkByDate(amount);
    }
    if(param.dateRange){
      const startDate = moment(param.dateRange[ 0 ]).format("YYYY-MM-DD");
      const endDate   = moment(param.dateRange[ 1 ]).format("YYYY-MM-DD");

      return this.mongoUser.getBulkByDate({dateRange: [ startDate, endDate ]});
    }
  }
  async getAllReservationDetailsPaginated(param){
    logger.info(`getPaginatedReservation... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }

  async updateReservation(params, data){
    logger.info("Updating Reservation..");
    return this.mongoUser.update(params, data)
  }

  async deleteReservation(params){
    logger.info("Deleting Reservation..");
    return this.mongoUser.deleteOne(params)
  }

}
module.exports = ReservationService;