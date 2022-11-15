const axios  = require("axios");
const logger = require("../lib/logger");

function customGetRequest(apiEndpoint, paramOptions){
  return axios
    .get(apiEndpoint, paramOptions)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      logger.info(`Get Request Error ${error.response}`);
      return error.response;
    });
}

function customPostRequest(apiEndpoint, postData, paramOptions){
  const req_data = postData;

  logger.info(`Req-Data ${req_data}`);
  return axios
    .post(apiEndpoint, postData, paramOptions)
    .then((responsedata) => {
      return responsedata;
    })
    .catch((error) => {
      return error.response || error;
    });
}
module.exports = { customGetRequest, customPostRequest };
