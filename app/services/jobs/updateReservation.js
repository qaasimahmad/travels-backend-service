require('../../lib/mongo');
const ReservationService = require("../../services/reservations");
const logger             = require("../../lib/logger");
const moment             = require('moment');

async function updateReservation(){
  try{
    logger.info(`########## Job Started ###########`);
    const reservations = (await new ReservationService().getAllReservationDetails({}));

    for (let item of reservations){
      const today   = moment(new Date().toISOString().slice(0, 10)).format("YYYY-MM-DD");
      const endDate = moment(item.returnDate).format("YYYY-MM-DD");
      const {_id}   = item;
      //Check if the reservation is past expiryDate(endDate)
      if(item.isActive === true  && today > endDate){
        const updatedReservation = await new ReservationService()
          .updateReservation({_id}, {isActive: false});
        if(updatedReservation.isActive === false){
          logger.info(`🕺 Reservation with Id {${_id}} updated Sucessfully!`);
        }
        // const user             = await new UserService().getSingleUserDetails({_id: updatedReservation.userId});
        // const flightPackageIds = user.flightPackages;
        // const packageIndex     = flightPackageIds.indexOf(flightPackageId);

        // flightPackageIds.splice(packageIndex, 1);
        // await new UserService().updateUser({_id: updatedReservation.userId}, {
        //   flightPackages: flightPackageIds
        // });
        // logger.info('Flight Package Popped! 🦾 ');
      }
      logger.info('No Jobs Ready to run ...  😞');
    }
  } catch(error){
    throw new Error(`Update Reservation Error! ${error}`)
  }
}

module.exports = updateReservation;
