function respond(res, data, httpCode){
  const response = {
    error:   data.error,
    data:    data.response,
    code:    httpCode,
    message: data.message,
    count:   data.count,
    total:   data.total,
    page:    data.page,
    pages:   data.pages,
    limit:   data.limit,
    meta:    data.meta,
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Method", "*");

  res.writeHead(httpCode);
  res.end(JSON.stringify(response));
}

module.exports.success = function success(res, response, httpCode = 200){
  const data = response;

  data.error = false;
  respond(res, data, httpCode);
};

module.exports.failure = function failure(res, response, httpCode = 503){
  const data = response;

  data.error = true;
  respond(res, data, httpCode);
};
