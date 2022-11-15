const MongoDBHelper  = require(".");
const logger         = require("../lib/logger");
const BookingModel   = require("../models/bookings");
const grandSumsModel = require("../models/grandSums");
const moment         = require('moment');
const utils          = require("../lib/utils");

class BookingService{
  constructor(){
    this.mongoUser = new MongoDBHelper(BookingModel);
    this.grandSums = new MongoDBHelper(grandSumsModel);
  }

  async addBooking(data){
    logger.info(`Adding new Booking...`);
    return this.mongoUser.save(data);
  }
  async getSingleBookingDetails(param){
    logger.info(`getSingleBookingDetails... ${param}`);
    return this.mongoUser.get(param);
  }
  async getAllBookingDetails(param){
    logger.info(`getAllUsersDetails... ${param}`);
    return this.mongoUser.getBulkUsers(param);
  }
  async getAllBookingsPaginated(param){
    logger.info(`getPaginatedBookings... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }
  async getAllBookingDetailsByDate(param){
    if(param.date){
      const daysToDeduct= utils.getAmountToRemoveFromDate(param.date);

      logger.info(`getBookingDetailsByDate... ${JSON.stringify(daysToDeduct)}`);
      return this.mongoUser.getBulkByDate(daysToDeduct);
    }
    if(param.dateRange){
      const startDate = moment(param.dateRange[ 0 ]).format("YYYY-MM-DD");
      const endDate   = moment(param.dateRange[ 1 ]).format("YYYY-MM-DD");

      return this.mongoUser.getBulkByDate({dateRange: [ startDate, endDate ]});
    }
  }
  async getAllBookingsRevenue(param){
    let id   = param.id ? param.id : null;
    let sort = param .sort ? param.sort : -1;
    if(param.date){
      const daysToDeduct= utils.getAmountToRemoveFromDate(param.date);

      logger.info(`getBookingRevenueByDate... ${JSON.stringify(daysToDeduct)}`);
      return this.grandSums.getAllBookingRevenueByDate({date: daysToDeduct, id, sort});
    }
    if(param.dateRange && !param.allowusernames){
      const startDate = new Date(param.dateRange[ 0 ]);
      const endDate   = new Date(param.dateRange[ 1 ]);

      return this.grandSums.getAllBookingRevenueByDate({dateRange: [ startDate, endDate ], id, sort});
    }
    return this.grandSums.getAllBookingRevenue();
  }

  async getAllBookingsRevenuebyUsers(param){
    if(param.date && param.allowusernames){
      const daysToDeduct= utils.getAmountToRemoveFromDate(param.date);

      logger.info(`getBookingRevenueWithUsersByDate... ${JSON.stringify(daysToDeduct)}`);
      return this.grandSums.getAllBookingRevenueByDate({date: daysToDeduct});
    }
    if(param.dateRange && param.allowusernames){
      const startDate = new Date(param.dateRange[ 0 ]);
      const endDate   = new Date(param.dateRange[ 1 ]);

      return this.grandSums.getAllBookingRevenueByDate({dateRange: [ startDate, endDate ]});
    }
    return this.grandSums.getAllBookingRevenue();
  }
  async updateBookings(params, data){
    logger.info("Updating Bookings..")
    return this.mongoUser.update(params, data)
  }
  async getBookingsCount(params){
    logger.info(`Bookings Count.. ${params}`)
    return this.grandSums.getCount(params);
  }
}
module.exports = BookingService;
