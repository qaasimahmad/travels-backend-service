const Response                                            = require("../commons/responses");
const httpCode                                            = require("../commons/httpCode");
const AirportService                                      = require("../services/airports");
const Sentry                                              = require("../lib/sentry");
const logger                                              = require("../lib/logger");
const utils                                               = require('../lib/utils');
const Booking                                             = require("../models/bookings");
const BookingService                                      = require("../services/bookings");
const grandSum                                            = require("../models/grandSums");
const {validateDateParams, validateFlightOfferSortParams} = require("./helper");
const UserService                                         = require("../services/users");


class Airports extends AirportService{
  async getAirportDetails(req, res){
    const {q}    = req.query;
    if(!q){
      return Response.failure(res, {response: {},
        message:  "OOps! Expecting at least a keyword like 'LO' or 'B' "},
      httpCode.BAD_REQUEST);
    }

    try{
      const result = await new AirportService().getAirportDetails(q);

      const count = result.length;

      return Response.success(res, {response: result, message: `Result for ${q} Fetched`, count }, httpCode.OK);
    } catch(error){
      logger.error(`Error Occured! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Airports Search Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFlightOffersPost(req, res){
    const flightOfferRequest = req.body;
    let sort;
    if(flightOfferRequest.sort){
      const isValidSortParam =  validateFlightOfferSortParams(flightOfferRequest.sort);
      if(isValidSortParam === false){
        return Response.failure(res, {response: {}, message: "Invalid sort param passed"},
          httpCode.UNPROCESSED_ENTITY)
      }
      sort = flightOfferRequest.sort || "";
    }

    try{
      if(!flightOfferRequest.searchCriteria){
        return Response.failure(res, {response: {}, message: "searchCriteria is Required"}, httpCode.UNPROCESSED_ENTITY)
      }
      /* Accept the stop Filters here*/
      let normalizedFilter = "";
      if(flightOfferRequest.filters){
        if(flightOfferRequest.filters.stops){
          const {stops}    = flightOfferRequest.filters;

          normalizedFilter = utils.transformFilters(stops);
        }
      }
      const cabinRestrictions      = flightOfferRequest.searchCriteria.flightFilters.cabinRestrictions;
      const normalizedOfferRequest = utils.transformCabinEntry(flightOfferRequest, cabinRestrictions, 'POST');
      const response               = await new AirportService().
        getFlightOffers(normalizedOfferRequest, 'POST', normalizedFilter, sort);

      /* TODO: Sort The flightOffers by price Ascending */
      if(response.error === false){
        return Response.success(res, {response: response.flightOffers, message:  "Flight Offers Fetched Successfully!",
          count:    response?.flightOffers?.data?.length/2, meta:     response.airlinesAirportsData},
        httpCode.OK);
      } else {
        return Response.failure(
          res,
          { response: response.errorContent, message: "Unexpected Error Occured!" },
          httpCode.BAD_REQUEST
        );
      }
    } catch(error){
      logger.info(`Fetch FlightOffers Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch FlightOffers Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFlightOffersGet(req, res){
    const flightOfferRequest = req.query;
    const travelClass        = flightOfferRequest.travelClass ? flightOfferRequest.travelClass : "";

    try{
      let sort;
      if(flightOfferRequest.sort){
        const isValidSortParam =  validateFlightOfferSortParams(flightOfferRequest.sort);
        if(isValidSortParam === false){
          return Response.failure(res, {response: {}, message: "Invalid sort param passed"},
            httpCode.UNPROCESSED_ENTITY)
        }
        sort = flightOfferRequest.sort || "";
      }
      /* Accept the stop Filters here*/
      let normalizedFilter = "";
      if(flightOfferRequest.stops){
        const {stops}    = flightOfferRequest;

        normalizedFilter = utils.transformFilters(stops);
      }
      delete flightOfferRequest.stops;
      const normalizedParams       = utils.normalizeParams(flightOfferRequest);
      const normalizedOfferRequest = utils.transformCabinEntry(normalizedParams, travelClass, 'GET');
      const response               = await new AirportService()
        .getFlightOffers(normalizedOfferRequest, 'GET', normalizedFilter, sort);

      if(response.error === false){
        return Response.success(res, {response: response.flightOffers,
          message:  "Flight Offers Fetched Successfully!",
          count:    response?.flightOffers?.data?.length/2, meta:     response.airlinesAirportsData},
        httpCode.OK);
      } else {
        return Response.failure(
          res,
          { response: response.errorContent, message: "Unexpected Error Occured!" },
          httpCode.BAD_REQUEST
        );
      }

    } catch(error){
      logger.info(`Fetch FlightOffers Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch FlightOffers Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAirlinesAndCodes(req, res){
    try{
      const {
        page, sort, limit,code
      }           = req.query;
      const param = {};
      if(page) param.page = page;
      if(sort) param.sort = sort;
      if(limit) param.limit = limit;
      param.query  = {};
      param.fields = {_id: 0};

      if(code){
        param.query    = {code};
        const response = await new AirportService().getAirlinesAndCodes(param);

        if(response) return Response.success(res,
          {response, message: "Airlines & Codes successfully Fetched!"},
          httpCode.OK);
      } else if(!code){
        const response = await new AirportService().getAirlinesAndCodes(param);
        if(response) return Response.success(res,
          {response, message: "Airlines & Codes successfully Fetched!"},
          httpCode.OK);
      }
    } catch(error){
      logger.info(`Get Airlines and Codes Error!`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Airlines & Codes Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }


  }

  async confirmFlightOffersPricing(req,res){
    try{
      const userId                = req.user.id;
      const {data:{flightOffers}} = req.body;
      const addOn                 = req.body.data.addOn || null;
      const response              = await this.getConfirmedFlightOffersPricing(userId, addOn, flightOffers);
      if(response.error === false){

        return Response.success(res, {response: response.data,
          message:  "Flight Offers Pricing Fetched Successfully!"
        },
        httpCode.OK);
      }
      else {
        return Response.failure(
          res,
          { response: response.errorContent, message: "Unexpected Error Occured!" },
          httpCode.BAD_REQUEST
        );
      }
    } catch(error){
      logger.info(`Flight Offers Pricing! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Offers Pricing Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async createFlightOrder(req, res){
    const {data:{flightOffers}}   = req.body;
    const {data:{travelers}}      = req.body;
    const {data:{billingDetails}} = req.body;

    try{
      const response = await new AirportService().createFlightOrder(flightOffers, travelers);
      if(response.error === false){
        const newBookingDetails = {
          associatedRecords: response.data.data.associatedRecords,
          flightOffers:      response.data.data.flightOffers,
          travelers:         response.data.data.travelers,
          billingDetails,
          bookingIdProvider: response.data.data.id,
          ref:               response.data.data.associatedRecords?.[0]?.reference,
          userId:            req.user.id,
          ticketNumber:      "None"
        }

        const newBooking        = new Booking(newBookingDetails);

        const savedData  = await newBooking.save();
        const grandTotal = response.data.data.flightOffers[ 0 ].price.grandTotal;
        const user       = await new UserService().getSingleUserDetails({userId: req.user.id});

        await new grandSum({
          userId:   req.user.id,
          username: user.username,
          grandTotal
        }).save();

        const bookingId =  savedData._id;
        //Send the bookingId and the content to update to the bull Job for processing[Queuing]
        const updateContent     = {
          bookingStatus:     'Booked',
          bookingId,
          bookingProviderRef:                response.data.data.associatedRecords?.[0]?.reference,
          bookingIdProvider: response.data.data.id,
          userId:            req.user.id
        }

        utils.addBookingContentToQueue(updateContent);
        response.data.bookingId = bookingId;
        return Response.success(res, {response: response.data, message: "OK"}, httpCode.CREATED)
      }
      else {
        return Response.failure(
          res,
          { response: response.errorContent, message: "Unexpected Error Occured!" },
          httpCode.BAD_REQUEST
        );
      }
    } catch(error){
      logger.info(`Flight Order Error! ${JSON.stringify(error)}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Order Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFlightOrderedByBookingId(req, res){
    const {bookingId} = req.query;
    if(!bookingId){
      return Response.failure(res, {response: {}, message: "bookingId is required"},
        httpCode.UNPROCESSED_ENTITY)
    }
    let param;
    const encodedBookingId = encodeURIComponent(bookingId);
    const decodedBookingId = decodeURIComponent(encodedBookingId);
    if(bookingId && encodedBookingId.length === 24){
      param = {_id: bookingId};
    } else if(bookingId && encodedBookingId.length > 24){
      param = {bookingIdProvider: decodedBookingId}
    }
    try{
      if(bookingId){
        const booking = await new BookingService().getSingleBookingDetails(param);
        if(!booking){
          return Response.failure(res, {response: {}, message: "No Boooking data found!"}, httpCode.NOT_FOUND);
        }

        return Response.success(res, {response: booking, message: "Booking Data Successfully Fetched!"}, httpCode.OK)
      }

    } catch(error){
      logger.info(`fetch Booking By ID Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Booking Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFlightOrderedByUserId(req, res){
    const userId = req.query.id;

    let param;
    if(userId){
      param = {_id: userId};
    }

    try{
      if(userId){
        param.query   = {userId};
        const booking = await new BookingService().getAllBookingsPaginated(param);
        if(!booking){
          return Response.failure(res, {response: {}, message: "No Boooking data found!"}, httpCode.NOT_FOUND);
        }
        const airportsMetaData = await new AirportService().getAirportsMetaFromQuery(booking.docs);

        return Response.success(res, {response: booking, message:  "Booking Data Successfully Fetched!",
          meta:     airportsMetaData}, httpCode.OK)
      }
    } catch(error){
      logger.info(`fetch Booking By ID Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Booking Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllFlightsOrderedAdmin(req, res){
    try{
      const {
        page, sort, limit,date,startDate,endDate
      } = req.query;

      const param = {};
      if(page) param.page = page;
      if(sort) param.sort = sort;
      if(limit) param.limit = limit;
      if(date) param.date = date;
      if(startDate && endDate){
        param.dateRange = [ startDate, endDate ]
      }
      let bookings;

      param.query       = {};
      if(date){
        const isValidDate = validateDateParams(date);
        if(isValidDate){
          const bookingsByDate = await new BookingService().getAllBookingDetailsByDate(param);

          bookings             = bookingsByDate;
        } else {
          return Response.failure(res, {response: {}, message: "Invalid date found!"},
            httpCode.UNPROCESSED_ENTITY)
        }
      }
      if(startDate && endDate){
        const bookingsByDateRange = await new BookingService().getAllBookingDetailsByDate(param);

        bookings                  = bookingsByDateRange;
      }
      if(!date && !startDate && !endDate){
        const bookingsPaginated = await new BookingService().getAllBookingsPaginated(param);

        bookings                = bookingsPaginated[ 'docs' ];
      }
      const allBookings = [];

      for (let booking of bookings){
        const segments    = booking.flightOffers[ 0 ].itineraries[ 0 ].segments;
        const userBioData = await this.getTravelersData(booking.travelers);

        for (let bio of userBioData){
          const bioData = {
            firstName:    bio.bio.firstName,
            lastName:     bio.bio.lastName,
            phoneNumber:  bio.bio.phoneNumber,
            bookingDate:  booking.createdAt,
            issuedDate:   booking.createdAt,
            travelDate:   (await this.getJourneyMap(segments)).dates.travelDate,
            returnDate:   (await this.getJourneyMap(segments)).dates.returnDate,
            route:        (await this.getJourneyMap(segments)).journey,
            pnr:          booking.bookingIdProvider,
            ticketNumber: booking.ticketNumber
          }

          allBookings.push(bioData);
        }
      }
      return Response.success(res, {response: allBookings, message:  "All Bookings Fetched Successfully!",
        total:    bookings.total,
        limit:    bookings.limit,
        page:     bookings.page,
        pages:    bookings.pages},httpCode.OK)
    } catch(error){
      logger.error('Fatal Error!', error);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Booking Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async deleteFlightOrdered(req, res){
    const {bookingId}      = req.params;
    //Using Amadeus bookingID: const encodedBookingId = encodeURIComponent(bookingId);
    if(!bookingId){
      return Response.failure(res, {response: {}, message: "Missing bookingId!"}, httpCode.BAD_REQUEST);
    }
    try{
      await Booking.findByIdAndDelete(bookingId);
      //Using Amadeus bookingID: const response = await new AirportService().this.deleteFlightOrdered(encodedBookingId);
      return Response.success(res, {response: {}, message: `Flight Order with Id=>${bookingId} is deleted!`},
        httpCode.DELETED);
    } catch(error){
      logger(`Delete Booking Error! ${error}`)
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Delete Booking Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSeatMapPreBooking(req, res){
    const {data:{flightOffers}} = req.body;

    try{
      const response = await new AirportService().getSeatMapPreBooking(flightOffers);
      if(response.error === false){
        delete response.data.meta;
        return Response.success(res, {response: response.data, count:    response.count,
          message:  `Seat Maps Fetched Successfully!`
        },
        httpCode.OK);
      }
      else {
        return Response.failure(
          res,
          { response: response.errorContent, message: "Unexpected Error Occured!" },
          httpCode.BAD_REQUEST
        );
      }
    } catch(error){
      logger(`Fetch Seat Map Error! ${error}`)
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Seat Map Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }
}
module.exports = new Airports();