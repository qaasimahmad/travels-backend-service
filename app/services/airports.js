const MongoDBHelper     = require(".");
const logger            = require("../lib/logger");
const AirportModel      = require("../models/airports");
const AirlineModel      = require("../models/airlines");
const Amadeus           = require("../services/amadeus/amadeus");
const utils             = require("../lib/utils");
const {client}          = require("../services/queues/index");
const airlinesWithLogos = require("../lib/UpdatedWithLogos-2.json");
const airportsWithNames = require('../lib/airports.json');

/* TODO: - Create Admin Log for All Errors and Success and assign uniqueIds to them
         - Implement Caching for all Routes to improve response Time
*/

class AirportService{
  constructor(){
    this.mongoUser = new MongoDBHelper(AirportModel);
    this.airline   = new MongoDBHelper(AirlineModel);
  }

  async getAirportDetails(param){
    logger.info(`getSingleAirportDetails... ${param}`);
    return this.mongoUser.getAirportsMetaData(param);
  }

  async getFlightOffers(payload, requestType, filter="", sort=""){
    if(requestType === 'POST'){
      try{
        let newFlightOffers = {};
        const {result}      = await Amadeus.shopping.flightOffersSearch.post(JSON.stringify(payload));
        if(!result.errors){
          const flightOffers = {
            data: result.data
          }
          if(!result.data.description){
            if(filter != ""){
              const filteredOffers  = utils.filterByStops(flightOffers.data, filter);

              newFlightOffers =  {
                data: filteredOffers
              }
            } else {
              newFlightOffers = {data: flightOffers.data};
            }

            const sortedFlightOffers = sort != "" ?
              await this.getLatestFlightOffersSortedByPrice(newFlightOffers, sort):
              newFlightOffers;

            const airlineCarriers      =  await this.getAirlinesMetaData(sortedFlightOffers);
            const airportsData         =  await this.getAirportsMetaData(sortedFlightOffers);
            const airlinesAirportsData = {
              airlineCarriersInfo: airlineCarriers,
              airportsInfo:        airportsData
            }

            return {
              error:        false,
              flightOffers: sortedFlightOffers,
              airlinesAirportsData
            };
          }
        }
      } catch(error){
        if(error.description){
          const status = error.description[ 0 ].status;
          if(status === 400){
            return {
              error:        true,
              errorContent: {
                details: error.description[ 0 ].detail || null,
                source:  error.description[ 0 ].source || {}
              }
            }
          }
        }
      }
    } else {
      try{
        let newFlightOffers = {};
        if(payload.sort) delete payload.sort;
        const {data}     = await Amadeus.shopping.flightOffersSearch.get(payload);


        if(!data.errors){
          const flightOffers         = {
            data: data
          }
          if(filter != ""){
            const filteredOffers  = utils.filterByStops(flightOffers.data, filter);

            newFlightOffers =  {
              data: filteredOffers
            }
          } else {
            newFlightOffers = {data: flightOffers.data};
          }
          const sortedFlightOffers   = sort != "" ?
            await this.getLatestFlightOffersSortedByPrice(newFlightOffers, sort):
            newFlightOffers;
          const airlineCarriers      =  await this.getAirlinesMetaData(sortedFlightOffers);
          const airportsData         =  await this.getAirportsMetaData(sortedFlightOffers);
          const airlinesAirportsData = {
            airlineCarriersInfo: airlineCarriers,
            airportsInfo:        airportsData
          }

          return {
            error:        false,
            flightOffers: sortedFlightOffers,
            airlinesAirportsData
          };
        }
      } catch(error){
        if(error.description){
          const status = error.description[ 0 ].status;
          if(status === 400){
            return {
              error:        true,
              errorContent: {
                details: error.description[ 0 ].detail || null,
                source:  error.description[ 0 ].source || {}
              }
            }
          }
        }
      }
    }
  }

  async getAirlinesMetaData(flightOffers){
    const itrenaries           = flightOffers.data.map((item)=>{
      return item.itineraries;
    });
    const flattenedIterenaries = itrenaries.flat();

    const segments          = flattenedIterenaries.map((item)=>{
      return item.segments;
    });
    const flattenedSegments = segments.flat();

    const carriers = flattenedSegments.map((item)=>{
      return item.carrierCode;
    });

    return await this.getCarrierData(carriers);
  }

  async getAirportsMetaData(flightOffers){
    if(!flightOffers.data){
      flightOffers = {data: flightOffers}
    }
    const itrenaries           = flightOffers?.data?.map((item)=>{
      return item.itineraries;
    });
    const flattenedIterenaries = itrenaries.flat();

    const segments          = flattenedIterenaries.map((item)=>{
      return item.segments;
    });
    const flattenedSegments = segments.flat();

    const iataCodes = flattenedSegments.map((item)=>{
      return {
        "depatureCode": item.departure.iataCode,
        "arrivalCode":  item.arrival.iataCode
      };
    });

    return await this.getAirportsData(iataCodes);
  }

  async getAirportsMetaFromQuery(paginatedBookingData){
    const airportsMeta = [];

    for (let doc of paginatedBookingData){
      const flightOffers = doc.flightOffers;
      const metaData     = await new AirportService().getAirportsMetaData(flightOffers);

      airportsMeta.push(metaData);
    }
    return airportsMeta;
  }

  async getCarrierData(airCarriers){
    const airlines = [];

    for (let item of airCarriers){
      const airline =  airlinesWithLogos.filter((data)=> item === data.code);

      airlines.push(airline[ 0 ]);
    }
    return airlines;
  }

  async getAirportsData(iataCodes){
    const airports = [];

    for (let item of iataCodes){
      const airport =  airportsWithNames.filter(
        (data)=> (item.depatureCode === data.code || item.arrivalCode === data.code));

      airports.push(airport[ 0 ]);
    }
    return airports;
  }

  async getConfirmedFlightOffersPricing(userId, addOn, flightOffer){
    try{

      logger.info(`AddOn ${addOn}`);
      if(addOn != null){
        const resp = await client.hset(`${userId}:addons`, addOn);

        logger.info(`AddOn successfully set in Redis ${resp}`);
      }

      const {result}              = await Amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          'data': {
            'type':         'flight-offers-pricing',
            'flightOffers': [ flightOffer[ 0 ] ]
          }
        })
      );

      let confirmedOfferPricing;
      if(addOn != null){
        const addOns        = await client.hgetall(`${userId}:addons`);
        let grandTotal      = result?.data?.flightOffers[ 0 ]?.price?.grandTotal;
        const newGrandTotal = this.computeGrandTotal(addOns, grandTotal);

        result.data.flightOffers[ 0 ].price[ 'grandTotal' ] = `${newGrandTotal}`;
        const meta                                          = result.dictionaries;
        const Alert                                         = result.warnings ? result.warnings: {};

        confirmedOfferPricing                           = {
          data: {... result.data, meta, Alert},
        }
      } else if(addOn === null){
        const meta  = result.dictionaries;
        const Alert = result.warnings ? result.warnings: {};

        confirmedOfferPricing = {
          data: {... result.data, meta, Alert},
        }
        if(!result.errors){return {error: false, data: confirmedOfferPricing};}
      }

      if(!result.errors){return {error: false, data: confirmedOfferPricing};}
    } catch(error){
      if(error.description){
        const status = error.description[ 0 ].status;
        if(status === 400){
          return {
            error:        true,
            errorContent: {
              details: error.description[ 0 ].detail || null,
              source:  error.description[ 0 ].source || {}
            }
          }
        }
      }
    }
  }

  async createFlightOrder(confirmedOffers, travelers){
    try{
      const {result} = await Amadeus.booking.flightOrders.post(
        JSON.stringify({
          'data': {
            'type':         'flight-order',
            'flightOffers': [ confirmedOffers[ 0 ] ],
            'travelers':    travelers
          }
        })
      );

      if(!result.errors){
        const flightOrder    = {
          data: result
        }

        return {
          error: false,
          data:  flightOrder.data
        };
      }} catch(error){
      if(error.description){
        const status = error.description[ 0 ].status;
        if(status === 400){
          return {
            error:        true,
            errorContent: {
              details: error.description[ 0 ].detail || null,
              source:  error.description[ 0 ].source || {}
            }
          }
        }
      }
    }

  }

  async getFlightOrdered(id){
    try{
      const {result} = await Amadeus.booking.flightOrder(id).get();
      if(!result.errors){
        delete result.meta;
        result.Alert             = result.warnings? result.warnings : {};
        const flightOrderDetails = {
          data: result
        }

        return {error: false, data: flightOrderDetails};

      }
    } catch(error){
      if(error.description){
        const status = error.description[ 0 ].status;
        if(status === 400){
          return {
            error:        true,
            errorContent: {
              details: error.description[ 0 ].detail || null,
              source:  error.description[ 0 ].source || {}
            }
          }
        }
      }
    }

  }

  //Come Back Here To Test
  async deleteFlightOrdered(id){
    try{
      const result = await Amadeus.booking.flightOrder(id).delete();

      return {
        error: false,
        data:  result
      }
    } catch(error){
      if(error.description){
        const status = error.description[ 0 ].status;
        if(status === 400){
          return {
            error:        true,
            errorContent: {
              details: error.description[ 0 ].detail || null,
              source:  error.description[ 0 ].source || {}
            }
          }
        }
      }
    }
  }

  async getSeatMapPreBooking(flightOffer){
    try{
      const {result} = await Amadeus.shopping.seatmaps.post(
        JSON.stringify({
          'data': [ flightOffer[ 0 ] ]
        })
      );
      if(!result.errors){
        const seatMaps    = {
          data: result
        }

        return {
          error: false,
          data:  seatMaps.data,
          count: seatMaps.data.meta.count
        };
      }
    } catch(error){
      if(error.description){
        const status = error.description[ 0 ].status;
        if(status === 400){
          return {
            error:        true,
            errorContent: {
              details: error.description[ 0 ].detail || null,
              source:  error.description[ 0 ].source || {}
            }
          }
        }
      }
    }
  }

  async getAirlinesAndCodes(param){
    if(JSON.stringify(param.query)!= '{}'){
      return this.airline.get(param);
    }
    return this.airline.getBulkPaginated(param);
  }

  computeGrandTotal(addOns, grandTotal){
    const types = addOns.type.split(",");
    let newGrandTotal;
    if(types.length === 1){
      newGrandTotal = Number(addOns.cost) + Number(grandTotal);
    } else {
      const costs   = addOns.cost.split(",");

      newGrandTotal = Number(costs[ 0 ]) + Number(costs[ 1 ]) + Number(grandTotal);
    }
    return newGrandTotal;
  }

  async getJourneyMap(segments){
    const journeyMap  = {'journey': {}, 'dates': {}};
    const segmentSize = segments.length;
    const depature    = segments[ 0 ].departure.iataCode;
    const arrival     = segments[ segmentSize-1 ].arrival.iataCode;

    journeyMap[ 'journey' ][ 'depature' ] = depature;
    journeyMap[ 'journey' ][ 'arrival' ]  = arrival;
    journeyMap[ 'dates' ][ 'travelDate' ] = segments[ 0 ].departure.at;
    journeyMap[ 'dates' ][ 'returnDate' ] = segments[ segmentSize-1 ].arrival.at;
    return journeyMap;
  }

  async getTravelersData(travelersData){

    return travelersData.map((item)=>{

      return {
        bio: {
          title:        item.gender === 'MALE' ? 'Mr' : "Miss/Mrs",
          firstName:    item.name.firstName,
          lastName:     item.name.lastName,
          dateOfBirth:  item.dateOfBirth,
          emailAddress: item.contact.emailAddress,
          phoneNumber:  `+${item.contact.phones[ 0 ].countryCallingCode}-${item.contact.phones[ 0 ].number}`,
          companyName:  'None'
        },
        passport: {
          id:               item.documents[ 0 ].number,
          issuanceDate:     item.documents[ 0 ].issuanceDate,
          expiryDate:       item.documents[ 0 ].expiryDate,
          issuingCountry:   item.documents[ 0 ].issuanceCountry,
          issuanceLocation: item.documents[ 0 ].issuanceLocation || "None",
          nationality:      item.documents[ 0 ].nationality,
          status:           'valid',
          nin:              item.documents[ 0 ]?.nin || "None"
        }
      }
    });
  }

  async getLatestFlightOffersSortedByPrice(flightOffers, sort){
    let sorted;
    if(sort === 'asc'){
      sorted  = flightOffers.data.sort((priceA, priceB)=>{
        return (priceA.price.grandTotal - priceB.price.grandTotal);
      });
    } else {
      sorted = flightOffers.data.sort((priceA, priceB)=>{
        return (priceB.price.grandTotal - priceA.price.grandTotal);
      });
    }
    return {data: sorted};
  }

}

module.exports = AirportService;