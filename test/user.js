/* eslint-disable no-unused-vars */
const omit = require("lodash/omit");

process.env.NODE_ENV = "test";
let User             = require("../app/models/users");
const userService    = require('../app/services/users');

let chai     = require("chai");
let chaiHttp = require("chai-http");
let app      = require("../app/app");
const logger = require("../app/lib/logger");
let should   = chai.should();
let {expect} = chai;

chai.use(chaiHttp);
describe("Users", () => {
  beforeEach((done) => {
    //Before each test we empty the database
    User.deleteMany({}, (err) => {
      if(err) logger.info(`DB CleanUpError`);
      done();
    });
  });

  /*
   * Test the /POST route
   */
  describe("/POST user", () => {
    let user = {
      username: "kassim",
      password: "password",
      email:    "keshemogie24@gmail.com",
    };

    it("it should not POST a user without username field", (done) => {
      user = omit(user, [ "username" ]);
      chai
        .request(app)
        .post("/v1/users/signup")
        .send(user)
        .end((err, res) => {
          if(err) logger.info(`POST User Error` );
          res.should.have.status(422);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should not POST a user without password field", (done) => {
      user = omit(user, [ "password" ]);
      chai
        .request(app)
        .post("/v1/users/signup")
        .send(user)
        .end((err, res) => {
          if(err) logger.info(`POST User Error`);
          res.should.have.status(422);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should not POST a user without email field", (done) => {
      user = omit(user, [ "email" ]);
      chai
        .request(app)
        .post("/v1/users/signup")
        .send(user)
        .end((err, res) => {
          if(err) logger.info(`POST User Error`);
          res.should.have.status(422);
          res.body.should.be.a("object");
          done();
        });
    });

    it("it should POST a user if all fields are passed", (done) => {
      let newUser = {
        username: "Zaahir",
        password: "password",
        email:    "keshemogie24@gmail.com",
      };

      chai
        .request(app)
        .post("/v1/users/signup")
        .send(newUser)
        .end((err, res) => {
          if(err) logger.info(`POST User Error`);
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("data");
          res.body.should.have.property("error").eql(false);
          res.body.data.should.have.property("username");
          res.body.data.should.have.property("email");
          done();
        });
    });
  });

  describe("/GET health-check", () => {
    it("it should Display default welcome message", (done) => {
      chai
        .request(app)
        .get("/")
        .end((err, res) => {
          if(err) logger.info(`HealthCheck Error`);
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe("/POST login users", () => {
  let userLoginDetails = {
    email:    "keshemogie24@gmail.com",
    password: "password",
  };

  let newUser = {
    username:         "kassim",
    password:         "U2FsdGVkX19lwUNcu/fFjEYCvX7Md27bVP9qPp0fStU=",
    email:            "keshemogie24@gmail.com",
    confirmationCode: "1234"
  };

  it('should SAVE a new user', async()=>{
    const savedUser = await new userService().addUser(newUser);

    expect(savedUser).to.be.a('object');
    expect(savedUser).to.have.property('status').equal('Pending');
    expect(savedUser).to.have.property('username').equal(newUser.username);
  });

  it("it should VERIFY a new User", (done) => {
    chai
      .request(app)
      .get("/v1/auth/confirm/1234")
      .end((err, res) => {
        if(err) logger.info("Verify User Error");
        res.should.have.status(200);
        res.body.data.should.have.property("status").eql("Active");
        res.body.should.have.property("message");
        done();
      });
  });

  it("it should not LOGIN with missing password", (done) => {
    userLoginDetails = omit(userLoginDetails, [ "password" ]);
    chai
      .request(app)
      .post("/v1/users/login")
      .send(userLoginDetails)
      .end((err, res) => {
        if(err) logger.info(`POST Login Error`);
        res.should.have.status(422);
        done();
      });
  });

  it("it should not lOGIN with wrong email", (done) => {
    const newLoginUser = {
      email:    "keshemogie24@mail.com",
      password: "password"
    }

    chai
      .request(app)
      .post("/v1/users/login")
      .send(newLoginUser)
      .end((err, res) => {
        if(err) logger.info(`POST Login Error`);
        res.body.should.have.property("message");
        res.should.have.status(404);
        done();
      });
  });

  it("it should not login with missing email", (done) => {
    userLoginDetails = omit(userLoginDetails, [ "email" ]);
    chai
      .request(app)
      .post("/v1/users/login")
      .send(userLoginDetails)
      .end((err, res) => {
        if(err) logger.info(`POST Login Error`);
        res.should.have.status(422);
        done();
      });
  });

  it("it should not lOGIN users if supplied password does not match the existing one", (done) => {
    let userLoginDetailsWrong = {
      email:    "keshemogie24@gmail.com",
      password: "pass",
    };

    chai
      .request(app)
      .post("/v1/users/login")
      .send(userLoginDetailsWrong)
      .end((err, res) => {
        if(err) logger.info(`POST Login Error`);
        res.should.have.status(401);
        res.body.should.have.property("message");
        done();
      });
  });

  it("it should LOGIN users if supplied password matches the existing one", (done) => {
    const userLoginDetailsRight = {
      email:    "keshemogie24@gmail.com",
      password: "password",
    };

    chai
      .request(app)
      .post("/v1/users/login")
      .send(userLoginDetailsRight)
      .end((err, res) => {
        if(err) logger.info(`POST Login Error`);
        res.should.have.status(200);
        res.body.should.have.property("error").eql(false);
        res.body.data.should.have.property("token");
        res.body.should.have.property("message");
        done();
      });
  });
});
