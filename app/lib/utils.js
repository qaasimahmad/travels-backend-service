const assert                    = require('assert');
const CryptoJS                  = require("crypto-js");
const config                    = require("../config/config");
const randomString              = require('randomstring');
const {updateUserBookingsQueue} = require("../services/queues/index");
const logger                    = require('./logger');
const AWS                       = require('aws-sdk');

require("dotenv").config();

AWS.config.update({
  accessKeyId:     config.s3.accessKey,
  secretAccessKey: config.s3.secretKey,
});
// Set your region for future requests.
AWS.config.update({ region: config.s3.region });

const s3 = new AWS.S3();

class Utils{
  /**
   * @summary Send payload to specified mail address
   * @param payload The content of the mail
   */

  encryptPassword(pass, secret){
    return CryptoJS.AES.encrypt(pass, secret).toString();
  }
  decryptPassword(pass, secret){
    const hashedPassword   = CryptoJS.AES.decrypt(
      pass,
      secret
    );

    return hashedPassword.toString(CryptoJS.enc.Utf8)
  }
  switchDb(){
    return process.env.NODE_ENV === "test" ? config.test.dbUrl : process.env.DB_URL;
  }
  createToken(){
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token        = '';

    for (let i = 0; i < 25; i++){
      token += characters[ Math.floor(Math.random() * characters.length ) ];
    }
    return token;
  }
  transformCabinEntry(offerPayload, cabinRestrictions, requestType){
    if(requestType === 'POST'){
      assert(Array.isArray(cabinRestrictions), 'cabinRestrictions Must be An Array')
      const newCabin                                                              = cabinRestrictions.map((item)=> {
        const splitItem = item.cabin.split(" ");

        if(splitItem.length === 1){
          return splitItem[ 0 ].toUpperCase();

        } else if(splitItem.length === 2){
          return `${splitItem[ 0 ]}_${splitItem[ 1 ]}}`.toUpperCase();
        }
      });

      offerPayload.searchCriteria.flightFilters.cabinRestrictions[ 0 ][ 'cabin' ] = newCabin[ 0 ];
      return offerPayload;
    } else if(requestType === 'GET' && cabinRestrictions !== ""){
      let newTravelClass = "";
      const splitItem    = cabinRestrictions.split(" ");
      if(splitItem.length === 1){
        newTravelClass = splitItem[ 0 ].toUpperCase();

      } else if(splitItem.length === 2){
        newTravelClass = `${splitItem[ 0 ]}_${splitItem[ 1 ]}`.toUpperCase();
      }
      offerPayload.travelClass = newTravelClass;
      return offerPayload;
    } else {
      return offerPayload;
    }

  }

  transformFilters(filter){
    assert(typeof(filter)=== 'string', 'filter must be a string');
    if(filter){
      const splitItem = filter.split(" ");
      if(splitItem.length === 1){
        return splitItem[ 0 ].toUpperCase();

      } else if(splitItem.length === 3){
        return `${splitItem[ 0 ]}_${splitItem[ 1 ]}_${splitItem[ 2 ]}`.toUpperCase();
      } else if(splitItem.length === 2){
        return `${splitItem[ 0 ]}_${splitItem[ 1 ]}`.toUpperCase();
      }
    }
  }
  normalizeParams(flightOfferRequest){
    if(flightOfferRequest.nonStop){
      flightOfferRequest.nonStop = Boolean(flightOfferRequest.nonStop);
    }
    if(flightOfferRequest.adults){
      flightOfferRequest.adults = Number(flightOfferRequest.adults);
    }
    if(flightOfferRequest.children){
      flightOfferRequest.children = Number(flightOfferRequest.children);
    }
    if(flightOfferRequest.infants){
      flightOfferRequest.infants = Number(flightOfferRequest.infants);
    }
    if(flightOfferRequest.maxPrice){
      flightOfferRequest.maxPrice = Number(flightOfferRequest.maxPrice);
    }
    if(flightOfferRequest.max){
      flightOfferRequest.max = Number(flightOfferRequest.max);
    }
    return flightOfferRequest;
  }

  /* Filter by Stops */
  filterByStops(offers, preferedCount){
    if(preferedCount === "ONE"){
      preferedCount = 1;
    } else if(preferedCount === "TWO_OR_MORE"){
      preferedCount = 2;
    }

    let newOffer  = {};
    let newOffers = [];

    for (let offerItem of offers){
      let itn = offerItem.itineraries;

      for (let itnItem of itn){
        let segment       = itnItem.segments;
        let duration      = itnItem.duration;
        let segmentLength = segment.length;
        if(preferedCount === 1 && segmentLength === 1){
          newOffer = {
            type:                     "flight-offer",
            id:                       offerItem.id,
            source:                   "GDS",
            instantTicketingRequired: offerItem[ "instantTicketingRequired" ],
            nonHomogeneous:           offerItem[ "nonHomogeneous" ],
            oneWay:                   offerItem[ "oneWay" ],
            lastTicketingDate:        offerItem[ "lastTicketingDate" ],
            numberOfBookableSeats:    offerItem[ "numberOfBookableSeats" ],
            itineraries:              [ {
              duration: duration,
              segments: segment
            }
            ],
            price:                  offerItem[ "price" ],
            pricingOptions:         offerItem[ "pricingOptions" ],
            validatingAirlineCodes: offerItem[ "validatingAirlineCodes" ],
            travelerPricings:       offerItem[ "travelerPricings" ]
          }
          newOffers.push(newOffer);
        } else if(preferedCount >=2 && segmentLength >=2){
          newOffer = {
            type:                     "flight-offer",
            id:                       offerItem.id,
            source:                   "GDS",
            instantTicketingRequired: offerItem[ "instantTicketingRequired" ],
            nonHomogeneous:           offerItem[ "nonHomogeneous" ],
            oneWay:                   offerItem[ "oneWay" ],
            lastTicketingDate:        offerItem[ "lastTicketingDate" ],
            numberOfBookableSeats:    offerItem[ "numberOfBookableSeats" ],
            itineraries:              [ {
              duration: duration,
              segments: segment
            }
            ],
            price:                  offerItem[ "price" ],
            pricingOptions:         offerItem[ "pricingOptions" ],
            validatingAirlineCodes: offerItem[ "validatingAirlineCodes" ],
            travelerPricings:       offerItem[ "travelerPricings" ]
          }
          newOffers.push(newOffer);
        }
      }
    }

    const ids = newOffers.map(data => data.id);

    return newOffers.length > 0 ? newOffers.filter(({id}, index) => !ids.includes(id, index + 1)):[];
  }

  generateBookingId(){
    return randomString.generate({
      length:  12,
      charset: 'alphanumeric'
    });
  }
  generateFlightPackageId(){
    return randomString.generate({
      length:  16,
      charset: 'alphanumeric'
    });
  }

  addBookingContentToQueue(content){
    logger.info("Adding Content to Queue")
    return updateUserBookingsQueue.add(
      content,
      {
        jobId:    content.bookingId,
        attempts: 2
      }
    )
  }
  // Upload file to s3
  /**
   *
   * @param {} data The data to upload as a file
   * @param {} bucketName The name of the bucket to upload to
   * @param {} key The file name or identifier for file
   * @returns response object with location field
   */
  async uploadToS3(data, bucketName, key){
    return new Promise((resolve, reject) => {
      s3.upload(
        {
          Bucket: bucketName,
          Body:   data,
          Key:    key,
          //ACL: 'public-read',
        },
        (err, response) => {
          if(err){
            return reject(err);
          }
          if(response){
            return resolve(response);
          }
          return reject(err);
        }
      );
    });
  }

  getAmountToRemoveFromDate(date){
    const options =  {
      "today":         0,
      "yesterday":     1,
      "lastmonth":     30,
      "lastTwoMonths": 60,
      "thisyear":      365,
      "lastweek":      7
    }

    return options[ date ];
  }
}

module.exports = new Utils();