/* eslint-disable no-unused-vars */
const omit = require("lodash/omit");

process.env.NODE_ENV = "test";

let User          = require("../app/models/users");
const userService = require('../app/services/users');
const Token       = require("../app/models/token");
const Utils       = require("../app/lib/utils");

let chai     = require("chai");
let chaiHttp = require("chai-http");
let app      = require("../app/app");
const logger = require("../app/lib/logger");
let should   = chai.should();
let {expect} = chai;

describe("Auth", ()=>{

  describe("/POST requestPasswordReset", ()=>{
    let request = {
      email: "keshemogie24@gmail.com",
    };

    it("it should POST a password reset request", (done) => {
      chai
        .request(app)
        .post("/v1/auth/requestPasswordReset")
        .send(request)
        .end((err, res) => {
          if(err) logger.info(`POST User Error` );
          res.should.have.status(202);
          res.body.data.should.be.a("object");
          done();
        });
    });

    it("should DELETE all tokens Created", (done) => {
      Token.deleteMany({}, (err)=>{
        if(err) logger.info(`Token-DB CleanUpError`);
      })
      done();
    });

  })

  // describe('/POST reset Password', async()=>{
  //   // beforeEach((done) => {
  //   //   //Before each test we empty the database
  //   //   Token.deleteMany({}, (err) => {
  //   //     if(err) logger.info(`User-DB CleanUpError`);
  //   //     User.deleteMany({},(err)=>{
  //   //       if(err) logger.info(`Token-DB CleanUpError`);
  //   //     })
  //   //     done();
  //   //   });
  //   // });

  //   let resetPayload = {
  //     userId:   "6279b562ec0cc140f94f747f",
  //     token:    "3de9b20370f0bd8ff128bd8aa3ee202cc79e10003eb9045e0987110458220da8",
  //     password: "newpassword"
  //   }

  //   it("it should RESET the password", (done) => {
  //     chai
  //       .request(app)
  //       .post("/v1/auth/resetPassword")
  //       .send(resetPayload)
  //       .end((err, res) => {
  //         if(err) logger.info(`POST User Error` );
  //         res.should.have.status(200);
  //         res.body.data.should.be.a("object");
  //         done();
  //       });
  //   });
  // })

})