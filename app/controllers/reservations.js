const logger               = require('../lib/logger');
const Response             = require('../commons/responses');
const httpCode             = require('../commons/httpCode');
const PackageService       = require('../services/packages');
const UserService          = require("../services/users");
const Sentry               = require("../lib/sentry");
const ReservationService   = require('../services/reservations');
const {validateDateParams} = require("./helper");
const Airports             = require("../lib/airports.json");

class Reservation extends ReservationService{
  async createFlightReservation(req, res){
    const reservationRequest       = req.body;
    const {flightPackageId, email} = req.body;

    try{
      const flightPackage = await new PackageService().getSinglePackageDetails({flightPackageId});
      if(!flightPackage){
        return Response.failure(res, {response: {},
          message:  "Package does not Exist!"},
        httpCode.NOT_FOUND)
      }
      const flightReservation = await this.getSingleReservationDetails({flightPackageId, email});
      if(flightReservation){
        return Response.failure(res, {response: {}, message: "Already Reserved!"}, httpCode.CONFLICT)
      }

      const reservation      = {
        flightPackageId,
        surname:       reservationRequest.surname,
        firstName:     reservationRequest.firstName,
        middleName:    reservationRequest.middleName,
        email:         reservationRequest.email,
        phoneNumber:   reservationRequest.phoneNumber,
        from:          flightPackage.from || null,
        to:            flightPackage.to || null,
        returnDate:    flightPackage.endDate || null,
        passengerType: flightPackage.passengerType || null,
        isActive:      true
      }
      const savedReservation = await this.addReservation(reservation);

      try{
        const fullName           = `${savedReservation.firstName} ${savedReservation.middleName} 
        ${savedReservation.surname}`;

        const from   = Airports.find(item => item.code === savedReservation.from);
        const to     = Airports.find(item => item.code === savedReservation.to);
        const origin = `${from.state} ${from.country}`;
        const dest   = `${to.state} ${to.country}`;

        const reservationDetails = {
          username:      savedReservation.firstName,
          fullName,
          email:         savedReservation.email,
          reservationId: savedReservation._id,
          from:          origin,
          to:            dest,
          returnDate:    savedReservation.returnDate,
          adults:        savedReservation.passengerType[ 0 ][ 'adults' ] || 0,
          children:      savedReservation.passengerType[ 0 ][ 'children' ] || 0,
          infants:       savedReservation.passengerType[ 0 ][ 'adults' ] || 0
        }

        await new UserService().prepareNotifyReservationStatusMailAndSend(reservationDetails);
        const adminDetails = {
          email:       reservationDetails.email,
          action:      'Successful Reservation',
          description: 'None'
        }

        await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
        logger.info(`Reservation Mail Sent Successfully ✔`);
      } catch(error){
        logger.error(`Reservation Mail Failed to Send ✖ ${error}`);
      }
      return Response.success(res, {response: savedReservation,
        message:  "Reservation successfully saved!"},
      httpCode.ACCEPTED);
    } catch(error){
      logger.error(`Flight Reservation Error! ${JSON.stringify(error)}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Reservation Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async getFlightReservationById(req, res){
    const {id} = req.params;
    if(!id){
      return Response.failure(res,
        {response: {},
          message:  " 'reservationId' is a mandatory field!"},
        httpCode.UNPROCESSED_ENTITY)
    }
    try{
      const reservation = await this.getSingleReservationDetails({_id: id, isActive: true});
      if(!reservation || reservation === null){
        return Response.failure(res, {response: {}, message: "Reservation does not Exist!"})
      }
      return Response.success(res, {response: reservation, message: "Reservation Fetched Successfully!"},
        httpCode.OK);
    } catch(error){
      logger.error(`Fetch Flight Reservation Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Fetch Flight Reservation Error!!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFlightReservations(req, res){
    try{
      const {
        page, limit, date, startDate, endDate
      } = req.query;

      const param = {};
      if(page) param.page = page;
      if(limit) param.limit = limit;
      if(date) param.date = date;
      if(startDate && endDate){
        param.dateRange = [ startDate, endDate ]
      }
      param.query = {};
      // if(isActive === 'yes') param.query = {isActive: true}
      // if(isActive === 'no')  param.query = {isActive: false}
      param.sort  = {createdAt: -1}
      let response;

      if(date){
        const isValidDate = validateDateParams(date);
        if(isValidDate){
          const reservationsByDate = await this.getAllReservationsDetailsByDate(param);

          response                 = reservationsByDate;
        } else {
          return Response.failure(res, {response: {}, message: "Invalid date found!"},
            httpCode.UNPROCESSED_ENTITY)
        }
      }
      if(startDate && endDate){
        const reservationsByDateRange = await this.getAllReservationsDetailsByDate(param);

        response                      = reservationsByDateRange;
      }
      if(!date && !startDate && !endDate){
        const reservationsPaginated = await this.getAllReservationDetailsPaginated(param);

        response                    = reservationsPaginated;
      }

      return Response.success(res, { response, message: 'All Reservations fetched successfully',
        count:   response.docs ? response.docs.length : response.length
      }, httpCode.OK);
    } catch(error){
      logger.info(`Reservations Fetch Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Reservations Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteFlightReservation(req, res){
    const {id} = req.params;

    try{
      const reservation = await this.getSingleReservationDetails({_id: id});
      if(reservation){
        await this.deleteReservation({_id: id});
        return Response.success(res, {response: {},
          message:  "Flight Reservation Deleted Successfully!"},
        httpCode.DELETED)
      }
    } catch(error){
      logger.error(`Flight Reservation Delete Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Reservation Delete Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

}
module.exports = new Reservation();