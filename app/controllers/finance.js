const logger                                        = require('../lib/logger');
const Response                                      = require("../commons/responses");
const httpCode                                      = require("../commons/httpCode");
const BookingService                                = require('../services/bookings');
const {validateDateParams, validateDateCombination} = require("./helper");
const Sentry                                        = require("../lib/sentry");

class Finance extends BookingService{
  async fetchAllBookingsRevenue(req, res){
    try{
      const {
        date,startDate,endDate,allowusernames
      }           = req.query;
      const param = {};
      if(date) param.date = date;
      if(startDate && endDate){
        param.dateRange = [ startDate, endDate ];
      }
      if(allowusernames){
        param.id   = '$username';
        param.sort = -1;
      }
      let bookingsRevenue;

      param.query       = {};

      const isValidDateCombo = await validateDateCombination(req.query);

      if(isValidDateCombo !== "true"){
        return Response.failure(res, {response: {}, message: isValidDateCombo},
          httpCode.UNPROCESSED_ENTITY)
      }

      if(date){
        const isValidDate = validateDateParams(date);
        if(isValidDate){
          const revenue = await this.getAllBookingsRevenue(param);

          bookingsRevenue             = revenue;
        } else {
          return Response.failure(res, {response: {}, message: "Invalid date found!"},
            httpCode.UNPROCESSED_ENTITY)
        }
      }
      if(startDate && endDate){
        const revenue = await this.getAllBookingsRevenue(param);

        bookingsRevenue                  = revenue;
      }
      if(!date && !startDate && !endDate){
        const revenue   = await this.getAllBookingsRevenue(param);

        bookingsRevenue = revenue;
      }
      const bookingsCount    = await this.getBookingsCount(param);

      const transactionsInfo = {
        transactionVolume: bookingsCount,
        transactionValue:  bookingsRevenue[ 0 ]?.totalSpend || 0
      }
      if(allowusernames){
        const topTenUsers = bookingsRevenue.splice(0, 11);

        return Response.success(res, {response: topTenUsers,
          message:  "Bookings Revenue 'per user' Successfully fetched!"},
        httpCode.OK)
      }

      return Response.success(res, {response: transactionsInfo, message: "Bookings Revenue Successfully fetched!"},
        httpCode.OK)

    } catch(error){
      logger.error('Bookings Revenue Error!', error);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Bookings Revenue Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new Finance();