/* eslint-disable no-unused-vars */
const { createToken, sendConfirmationMail } = require("../../app/lib/utils");

process.env.NODE_ENV                        = "test";

let chai = require("chai");

const { expect } = chai;

const logger = require("../../app/lib/logger");
let should   = chai.should();

describe("Utils Unit Tests", () => {
  it("should CREATE and return a new confirmation token", (done) => {
    const token = createToken();

    logger.info(`Token is ${token}`);

    expect(token).to.be.a("string");
    done();
  });
});
