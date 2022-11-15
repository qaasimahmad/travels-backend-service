const omitAirportsItems     = {
  _id:            0,
  woeid:          0,
  phone:          0,
  type:           0,
  email:          0,
  url:            0,
  runway_length:  0,
  elev:           0,
  icao:           0,
  direct_flights: 0,
  carriers:       0,
  lon:            0,
  lat:            0
}

const omitUserItems = {
  password:         0,
  __v:              0,
  confirmationCode: 0,
  createdAt:        0,
  updatedAt:        0
}

module.exports = {omitAirportsItems, omitUserItems};