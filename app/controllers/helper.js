/* eslint-disable no-prototype-builtins */
const utils          = require("../lib/utils");
const config         = require("../config/config");
const AirportService = require("../services/airports");
const maxSize        = 1 * 1000 * 1000;
const multer         = require('multer');

const storage = multer.memoryStorage();

const upload   = multer({ storage, limits: { fileSize: maxSize }, }).fields([
  { name: 'header', maxCount: 1 },
  { name: 'footer1', maxCount: 1 },
  { name: 'footer2', maxCount: 1 },
  { name: 'footer3', maxCount: 1 },
  { name: 'footer4', maxCount: 1 },
]);

const getImageUrls = async(files)=>{
  const imageUrls    = [];
  const uploadedUrls = {
    "header": (await utils.
      uploadToS3(files[ 'header' ][ 0 ].buffer,
        config.s3.bucket,`${Date.now()}-geoPics-HeaderPkg`)).Location,
    "footer1": (await utils.
      uploadToS3(files[ 'footer1' ][ 0 ].buffer,
        config.s3.bucket,`${Date.now()}-geoPics-Footer1Pkg`)).Location,
    "footer2": (await utils.
      uploadToS3(files[ 'footer2' ][ 0 ].buffer,
        config.s3.bucket,`${Date.now()}-geoPics-Footer2Pkg`)).Location,
    "footer3": (await utils.
      uploadToS3(files[ 'footer3' ][ 0 ].buffer,
        config.s3.bucket,`${Date.now()}-geoPics-Footer3Pkg`)).Location,
    "footer4": (await utils.
      uploadToS3(files[ 'footer4' ][ 0 ].buffer,
        config.s3.bucket,`${Date.now()}-geoPics-Footer4Pkg`)).Location
  }

  imageUrls.push(uploadedUrls);
  return imageUrls;
}

const transformUserBookingRecord = async(reservations)=>{
  let newBookingRecord = [];
  if(reservations.length === 0) return [];

  for (let reservation of reservations){
    const bioData       = await new AirportService().getTravelersData(reservation.travelers);

    newBookingRecord.push(bioData);
  }
  return newBookingRecord;
}

const validateDateCombination = async(queryParams)=>{
  const regexpression = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  const reg           = new RegExp(regexpression);
  const matchedDates  = [];
  if(Object.keys(queryParams).length === 3){
    for (let key in queryParams){
      if(queryParams.hasOwnProperty(key)){
        const queryParamValue = queryParams[ key ];

        if(queryParamValue.match(reg)){
          matchedDates.push(queryParamValue);
        }
      }
    }
    if(matchedDates.length > 2){
      return "Invalid Date combination! There can be only 2 or 1 date passed in the query";
    } else {
      return 'true';
    }
  } else if(Object.keys(queryParams).length === 2 ){
    if(queryParams.date){
      return "Invalid Date combination! 'date' must passed alone!";
    } else if(!queryParams.startDate || !queryParams.endDate){
      return "Invalid Date combination! 'startDate' or 'endDate' is missing! ";
    } else {
      return 'true';
    }
  } else {
    return "true";
  }
}

const validateDateParams = (date)=>{
  const allowedDates = [ 'lastweek', 'lastmonth', 'lastTwoMonths', 'lastyear', 'today', 'yesterday' ];
  const found        = allowedDates.find(item=> item === date);

  return !(!found);
}

const validateFlightOfferSortParams= (param)=>{
  const validSortParams = [ 'asc', 'desc' ];

  return validSortParams.includes(param);
}

module.exports = {upload, getImageUrls, transformUserBookingRecord, validateDateParams,
  validateFlightOfferSortParams, validateDateCombination};