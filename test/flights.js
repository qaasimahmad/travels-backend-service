/* eslint-disable no-unused-vars */
const AirportService                        = require("../app/services/airports");

process.env.NODE_ENV                        = "test";

let chai = require("chai");

const { expect } = chai;

let chaiHttp = require("chai-http");
let app      = require("../app/app");
const logger = require("../app/lib/logger");
let should   = chai.should();

describe("Airports Unit Tests", () => {
  it("should Return a list of Airports", async() => {
    const query  = 'lagos';
    const result = await new AirportService().getAirportDetails(query);

    expect(result).to.be.an("array");
    expect(result).length.above(0);
  });
});

describe("/GET Airports Request", ()=>{
  let q = "Lagos";

  it("it should GET all Airports Details and Codes", (done) => {
    chai
      .request(app)
      .get(`/v1/airports/getAirports?q=${q}`)
      .end((err, res) => {
        if(err) logger.info(`Airports Fetch Error`);
        res.should.have.status(400);
        res.body.data.should.be.an("object");
        done();
      });
  });

})