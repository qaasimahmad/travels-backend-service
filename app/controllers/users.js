const utils              = require("../lib/utils");
const Response           = require("../commons/responses");
const httpCode           = require("../commons/httpCode");
const UserService        = require("../services/users");
const VisaRequestService = require("../services/visaAssistance");
const ContactService     = require("../services/contactList");
const Sentry             = require("../lib/sentry");
const jwt                = require("jsonwebtoken");
const logger             = require("../lib/logger");
const config             = require("../config/config");

const {
  mailSubjects:{
    signUp
  }
}                    = require("../lib/mailSubjects");
const {OAuth2Client} = require("google-auth-library");
const googleClientId = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(googleClientId);

class User extends UserService{
  async registerUser(req, res){
    const originalPassword  = req.body.password;
    const encryptedPassword = utils.encryptPassword(originalPassword, process.env.PASS_SECRET);
    const confirmationToken = utils.createToken();

    const newUser           = { ...req.body, password: encryptedPassword,  confirmationCode: confirmationToken};


    try{
      const found = await this.getSingleUserDetails({ email: req.body.email });

      if(found){
        return Response.failure(
          res,
          { response: {}, message: "Record already exists" },
          httpCode.CONFLICT
        );
      }

      const savedUser = await this.addUser(newUser);
      if(savedUser){
        /* Subscribe to NewsLetter Block Starts*/
        const contactFound = await ContactService.ContactListService.getSingleContactDetails({email: req.body.email});
        if(contactFound === null){
          const contactDetails = {
            email:  req.body.email,
            status: "subscribed"
          }

          const isSubscribed         = await ContactService.ContactListService.addContact(contactDetails);
          if(isSubscribed){
            const adminDetails = {
              email:       req.body.email,
              action:      'News Letter Subscription',
              description: 'None'
            }

            await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
            logger.info(`${req.body.username} is successfully subscribed to Geo-NewsLetter`);
          }
        }
        /* Subscribe to NewsLetter Block Ends*/

        try{
          const subscriber = await ContactService.ContactListService.getSingleContactDetails({email: req.body.email});

          await this.prepareMailAndSend(savedUser, signUp, confirmationToken, subscriber._id,);
          const response   = {
            _id:       savedUser._id,
            username:  savedUser.username,
            email:     savedUser.email,
            status:    savedUser.status,
            isAdmin:   false,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
          }

          return Response.success(
            res,
            { response, message: "Registration is successful! please check your email" },
            httpCode.CREATED
          );
        } catch(error){
          logger.error(`Failed to send Email ${error}`);
        }
      }
    } catch(error){

      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "User SignUp Error!"},
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async loginUser(req, res){
    const { email } = req.body;

    try{
      const user = await this.getSingleUserDetails({ email });
      if(!user){
        return Response.failure(
          res,
          { response: {}, message: "Oops!  we can't find any record for this user" },
          httpCode.NOT_FOUND
        );
      }  else if(user && user.status != 'Active'){
        return Response.failure(res, {
          response: {}, message: "Please Verify your email and return to login"}, httpCode.UNAUTHORIZED);
      } else {
        const originalPassword = utils.decryptPassword(user.password, process.env.PASS_SECRET);
        const accessToken      = jwt.sign(
          {
            id:      user._id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        if(req.body.password !== originalPassword){
          return Response.failure(
            res,
            { response: {}, message: "Password Mismatch Detected!" },
            httpCode.UNAUTHORIZED
          );
        }
        return Response.success(
          res,
          { response: { token: accessToken, userId: user._id },  message: "Login Successful" },
          httpCode.OK
        );
      }
    } catch(error){
      logger.info('LoginError', error);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Login Error" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyGoogleTokenAndSignIn(req, res){
    const {tokenId} = req.body;

    const feedback                      = await client.verifyIdToken({idToken: tokenId, audience: googleClientId});

    logger.info(`GoogleFeedback >>>, ${feedback.payload}`);
    const {email_verified, name, email} = feedback.payload;
    if(email_verified){
      logger.info(`Email Verified? YEAH!, ${email_verified}`);
      try{
        const user = await this.getSingleUserDetails({email});

        logger.info(`Google Existing User Found? ${user}`);
        if(user){
          logger.info(`Google Existing User Found? YEAH! ${user}`);
          const accessToken      = jwt.sign(
            {
              id:      user._id,
              isAdmin: user.isAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          )

          return Response.success(
            res,
            { response: { token: accessToken },  message: "Login Successful" },
            httpCode.OK
          );
        } else {
          logger.info("A New Google User? YEAH!");
          const password = `${email}${name}${process.env.JWT_SECRET}`;

          logger.info(`New Google User Pass ${password}`);

          try{
            const newUser = await this.addUser({username: name, email, password, status: "Active"});

            logger.info(`New Google User Added ${newUser}`);

            if(newUser){
              const accessToken      = jwt.sign(
                {
                  id:      newUser._id,
                  isAdmin: user.isAdmin,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
              )

              return Response.success(
                res,
                { response: { token: accessToken },  message: "Registration is successful" },
                httpCode.OK
              );
            }
          } catch(error){
            logger.error(`Error On Saving the new Google User ${error}`);
            Sentry.captureException(error);
            return Response.failure(
              res,
              { response: {}, message: "Google SignIn Error!" },
              httpCode.INTERNAL_SERVER_ERROR
            );
          }

        }
      } catch(error){
        logger.error(`Fatal Error! Google SignIn (: ${error}`);
        Sentry.captureException(error);
        return Response.failure(
          res,
          { response: {}, message: "Something went wrong" },
          httpCode.INTERNAL_SERVER_ERROR
        );
      }

    }

  }

  async getAllUsers(req, res){
    try{
      const {
        page, sort, limit, isAdmin, isDeleted
      } = req.query;

      const param = {};
      if(page) param.page = page;
      if(sort) param.sort = sort;
      if(limit) param.limit = limit;
      param.query      = {};
      let response;
      if(isAdmin && isDeleted){
        return Response.failure(res, {response: {},
          message:  "Please enter isAdmin or isDeleted as query param"},
        httpCode.BAD_REQUEST)
      }
      if(isAdmin === 'true'){
        let adminBool    = Boolean(isAdmin);

        param.conditions = {isAdmin: adminBool};
        param.fields     = {password: 0};
        response         = await this.getAllUserDetails(param);
        if(response){
          return Response.success(res, { response, message: 'Admin Users fetched successfully!',
            count:   Array.isArray(response)? response.length: 0
          }, httpCode.OK);
        }
      } else if(isAdmin === 'false'){
        return Response.failure(res, { response: {}, message: 'No Admin Users Found!'}, httpCode.NOT_FOUND);
      }
      if(isDeleted === 'true'){
        let isDeletedBool = Boolean(isDeleted);

        param.conditions = {isDeleted: isDeletedBool};
        param.fields     = {password: 0};
        response         = await this.getAllUserDetails(param);
        if(response){
          return Response.success(res, { response, message: 'Deleted Users fetched successfully',
            count:   Array.isArray(response)? response.length: 0
          }, httpCode.OK);
        }
      } else if(isDeleted === 'false'){
        let isDeletedBool = !isDeleted;

        param.conditions = {isDeleted: isDeletedBool};
        param.fields     = {password: 0};
        response         = await this.getAllUserDetails(param);
        if(response){
          return Response.success(res, { response, message: 'Deleted Users fetched successfully',
            count:   Array.isArray(response)? response.length: 0
          }, httpCode.OK);
        }
      }
      param.fields = {password: 0};
      response     = await this.getAllUserDetails(param);
      if(response){
        return Response.success(res, { response, message: 'fetched successfully',
          count:   Array.isArray(response)? response.length: 0
        }, httpCode.OK);
      }
    } catch(error){
      logger.info(`Users Fetch Error! ${error}`)
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Users Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSingleUser(req, res){
    try{
      const {id, username, visaAssistance} = req.query;
      if(!id && !username){
        return Response.failure(res, {response: {}, message: "id or username must be passed"}, httpCode.BAD_REQUEST);
      }
      if(id && !visaAssistance){
        const user     = await this.getSingleUserDetails({_id: id});
        if(!user){
          return Response.failure(
            res,
            { response: {}, message: "Oops!  we can't find any record for this user" },
            httpCode.NOT_FOUND
          );
        } else if(user && user.isDeleted === true){
          return Response.failure(res, {response: {},
            message:  "User has been deleted from Our Records"},
          httpCode.NOT_FOUND);
        }
        const response = {
          _id:                   user._id,
          username:              user.username,
          email:                 user.email,
          status:                user.status,
          isAdmin:               user.isAdmin,
          visaAssistanceRequest: user.visaAssistanceRequest,
          createdAt:             user.createdAt,
          updatedAt:             user.updatedAt
        }

        return Response.success(res, {response, message: `User ${id} Found!`}, httpCode.OK)
      }
      if(username && !visaAssistance){
        const user     = await this.getSingleUserDetails({username});
        if(!user){
          return Response.failure(
            res,
            { response: {}, message: "Oops!  we can't find any record for this user" },
            httpCode.NOT_FOUND
          );
        }
        const response = {
          _id:                   user._id,
          username:              user.username,
          email:                 user.email,
          status:                user.status,
          isAdmin:               user.isAdmin,
          visaAssistanceRequest: user.visaAssistanceRequest,
          createdAt:             user.createdAt,
          updatedAt:             user.updatedAt
        }

        return Response.success(res, {response, message: `User ${username} Found!`}, httpCode.OK)
      }
      if(visaAssistance){
        let param = {};
        if(id) param = {_id: id}
        if(username) param = {username}
        const user     = await this.getSingleUserDetails(param);
        if(!user){
          return Response.failure(
            res,
            { response: {}, message: "Oops!  we can't find any record for this user" },
            httpCode.NOT_FOUND
          );
        }
        const hasRequestedVisaAssistance = await this.getSingleUserDetails({visaAssistanceRequest: visaAssistance})
        if(hasRequestedVisaAssistance){
          const response = {
            _id:                   hasRequestedVisaAssistance._id,
            username:              hasRequestedVisaAssistance.username,
            email:                 hasRequestedVisaAssistance.email,
            status:                hasRequestedVisaAssistance.status,
            isAdmin:               hasRequestedVisaAssistance.isAdmin,
            visaAssistanceRequest: hasRequestedVisaAssistance.visaAssistanceRequest,
            createdAt:             hasRequestedVisaAssistance.createdAt,
            updatedAt:             hasRequestedVisaAssistance.updatedAt
          }

          return Response.success(res, {response, message: `User ${username} Found!`}, httpCode.OK)
        } else {
          return Response.failure(res, {response: {}, message: `No Assistnce Request was filed by this user!`},
            httpCode.NOT_FOUND)
        }
      }
    } catch(error){
      logger.info(`USers Fetch Error ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Users Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteUser(req, res){
    const {id}     = req.params;
    const {action} = req.query;

    try{
      const found =await this.getSingleUserDetails({_id: id});
      if(found){
        if(action === 'softDelete'){
          await this.updateUser({_id: id}, {isDeleted: true});
          return Response.success(res, {response: {}, message: "user Record Deleted"}, httpCode.RESET_CONTENT)
        } else if(action === 'hardDelete'){
          await this.deleteUser({_id: id});
          return Response.success(res, {response: {}, message: "user Record Deleted"}, httpCode.DELETED)
        }
      } else {
        return Response.failure(res, {response: {}, message: "user Not Found"}, httpCode.NOT_FOUND)
      }
    } catch(error){
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Users Delete Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async contactUs(req, res){
    try{

      try{
        await this.prepareContactUsMailAndSend(req.body);
        return Response.success(
          res,
          { response: {}, message: "We have received your message, We typically respond within 24 hours" },
          httpCode.ACCEPTED
        );
      } catch(error){
        logger.error(`Failed to send Email ${error}`);
      }
    } catch(error){
      Sentry.captureException(error);
      return Response.failure(res, {response: {},
        message:  "Contact Us Error!"},
      httpCode.INTERNAL_SERVER_ERROR);
    }

  }

  async requestVisaAssistance(req, res){
    try{
      const user = await this.getSingleUserDetails({_id: req.user.id});
      if(user){
        if(!req.file || req.file === undefined){
          return Response.failure(res, {response: {}, message: "Passport image missing!"},
            httpCode.BAD_REQUEST)
        } else if(req?.file?.fieldname === 'passport'){
          const passsportData = req.file.buffer;
          const filename      = `${Date.now()}-geoPics-${req?.file?.originalname}`;
          const passportUrl   = await utils.uploadToS3(passsportData, config.s3.bucket, filename);

          req.body.passportUrl      = passportUrl.Location;
          req.body.passportImageRaw = req.file.buffer.toString("base64");
          req.body.userId           = req.user.id;

          try{
            const updatedUser = await this.updateUser({_id: req.user.id}, {
              visaAssistanceRequest: true});
            if(updatedUser){
              const savedVisaRequest = await new VisaRequestService().addVisaRequest(req.body);
              if(savedVisaRequest){
                return Response.success(res, {response: savedVisaRequest,
                  message:  "VisaRequest saved successfully!"},
                httpCode.CREATED);
              } else {
                logger.error("Failed to Save Visa Request");
                return Response.failure(res, {response: {}, message: "Unexpected error occured!"},
                  httpCode.BAD_REQUEST)
              }
            } else {
              logger.error("Failed to Update User's visa request status");
              return Response.failure(res, {response: {}, message: "Unexpected error occured!"},
                httpCode.BAD_REQUEST)
            }
          } catch(error){
            logger.error(`Unexpected error occured ${error}`);
            return Response.failure(res, {response: {}, message: "Unexpected Error Occured!"});
          }
        }
      }
    } catch(error){
      logger.info(`Visa Assistance Request Error! ${error}`)
      Sentry.captureException(error);
      return Response.failure(res, {response: {},
        message:  "Visa Assistance Request Error!"},
      httpCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getSingleVisaRequest(req, res){
    const {id} = req.params;

    try{
      const user = await new VisaRequestService().getSingleVisaRequestDetails({_id: id});
      if(user){
        return Response.success(res, { response: user, message: 'Visa Request fetched successfully!'
        }, httpCode.OK);
      } else {
        return Response.failure(res, {response: {},
          message:  `No record with id ${id} found`},
        httpCode.NOT_FOUND)
      }
    } catch(error){
      logger.info(`Single Visa Request Fetch Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Single Visa Request Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllVisaRequests(req, res){
    try{
      const {
        page, sort, limit
      }           = req.query;
      const param = {};
      if(page) param.page = page;
      if(sort) param.sort = sort;
      if(limit) param.limit = limit;
      param.query = {};
      let response;

      response    = await new VisaRequestService().getAllVisaRequestPaginated(param);
      if(response){
        return Response.success(res, { response, message: 'All Visa Requests fetched successfully',
          count:   Array.isArray(response.docs)? response.docs.length: 0
        }, httpCode.OK);
      }
    } catch(error){
      logger.info(`Visa Requests Fetch Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Visa Requests Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateVisaRequest(req, res){
    try{
      const {id} = req.params;
      const user = await new VisaRequestService().getSingleVisaRequestDetails({_id: id});
      if(user){
        await new VisaRequestService().updateVisaRequest({_id: id},{
          status: 'resolved'
        });
        return Response.success(res, {response: {},
          message:  "Profile picture updated successfully!"},
        httpCode.DELETED);
      }
      return Response.failure(res, {response: {}, message: "No visa request record exists for this user"},
        httpCode.NOT_FOUND)
    } catch(error){
      logger.info(`Update Visa Request Error ${error}`)
      Sentry.captureException(error);
      return Response.failure(res, {response: {},
        message:  "Update Visa Request Error!"},
      httpCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserProfile(req, res){
    try{
      const user = await this.getSingleUserDetails({_id: req.user.id});
      if(user){
        if(req?.file?.fieldname === 'profilePic' && JSON.stringify(req.body) === '{}'){
          const profilePicData = req.file.buffer;
          const filename       = `${Date.now()}-geoPics-${req?.file?.originalname}`;
          const profilePicUrl  = await utils.uploadToS3(profilePicData, config.s3.bucket, filename);

          try{
            await this.updateUser({_id: req.user.id}, {
              imageUrl: profilePicUrl.Location,
              imageRaw: profilePicData.toString('base64')});
            return Response.success(res, {response: {imageUrl: profilePicUrl.Location},
              message:  "Profile picture updated successfully!"},
            httpCode.OK);
          } catch(error){
            return Response.failure(res, {response: {}, message: "Profile Picture Update Failed!"})
          }

        } else {
          try{
            if(req.body){
              if(req?.file?.fieldname === 'profilePic'){
                const filename       = `${Date.now()}-geoPics-${req.file.originalname}`;
                const profilePicData = req.file.buffer;
                const profilePicUrl  = await utils.uploadToS3(profilePicData, config.s3.bucket, filename);

                req.body.imageUrl = profilePicUrl.Location;
                req.body.imageRaw = req.file.buffer.toString("base64");
                const updatedUser = await this.updateUser({_id: req.user.id}, req.body);

                return Response.success(res, {response: updatedUser,
                  message:  "Profile picture updated successfully"},
                httpCode.OK);
              } else if(!req.file || req.file === undefined){
                const updatedUser = await this.updateUser({_id: req.user.id}, req.body);

                return Response.success(res, {response: updatedUser,
                  message:  "Profile updated successfully"},
                httpCode.OK);
              }
            }
          } catch(error){
            return Response.failure(res, {response: {}, message: "Profile Update Failed!"})
          }
        }
      }
      return Response.failure(res, {response: {}, message: "No record for this user Exists"}, httpCode.NOT_FOUND)

    } catch(error){
      logger.info(`UpdateUser Error ${error}`)
      Sentry.captureException(error);
      return Response.failure(res, {response: {},
        message:  "Update User Error!"},
      httpCode.INTERNAL_SERVER_ERROR);
    }

  }

  async subscribeToNewsLetter(req, res){
    try{
      const {email}      = req.body;
      const contactFound = await ContactService.ContactListService.getSingleContactDetails({email});
      if(contactFound === null){
        const contactDetails    = {
          email,
          status: "subscribed"
        }
        const savedSubscription = await ContactService.ContactListService.addContact(contactDetails);
        if(savedSubscription){
          const adminDetails = {
            email:       contactDetails.email,
            action:      'Successful NewsLetter Subscrpition',
            description: 'None'
          }

          await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
          logger.info(`${email} is successfully subscribed to Geo-NewsLetter`);
        }
        return Response.success(res, {response: savedSubscription,
          message:  "Welcome to Geo-NewsLetter!"},
        httpCode.CREATED);
      }
      return Response.failure(res, {response: {}, message: "Duplicate subscription request"},
        httpCode.CONFLICT)
    } catch(error){
      logger.info(`News Letter Subscription Error ${error}`)
      Sentry.captureException(error);
      return Response.failure(res, {response: {},
        message:  "News Letter Subscription Error!"},
      httpCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllNewsLetterSubscribers(req, res){
    try{
      const {
        page, sort, limit,status
      } = req.query;

      const param = {};
      if(page) param.page = page;
      if(sort) param.sort = sort;
      if(limit) param.limit = limit;
      param.query      = {};
      let response;
      if(status === 'subscribed'){

        param.conditions = {status};
        response         = await ContactService.ContactListService.getAllContactDetails(param);
        if(response){
          return Response.success(res, { response, message: 'All Subsribers fetched successfully!',
            count:   Array.isArray(response)? response.length: 0
          }, httpCode.OK);
        }
      } else if(status === 'unsubscribed'){
        param.conditions = {status};
        response         = await ContactService.ContactListService.getAllContactDetails(param);
        if(response){
          return Response.success(res, { response, message: 'All UnSubscibers fetched successfully!',
            count:   Array.isArray(response)? response.length: 0
          }, httpCode.OK);
        }
      }
      response = await ContactService.ContactListService.getAllListPaginated(param);
      if(response){
        return Response.success(res, { response, message: 'All Contacts fetched successfully',
          count:   Array.isArray(response.docs)? response.docs.length: 0
        }, httpCode.OK);
      }
    } catch(error){
      logger.info(`Contacts Fetch Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Contacts Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getNewsLetterSubscriberById(req, res){
    const {id} = req.params;

    try{
      const contact = await ContactService.ContactListService.getSingleContactDetails({_id: id});
      if(contact){
        return Response.success(res, { response: contact, message: 'Subscriber fetched successfully!'
        }, httpCode.OK);
      } else {
        return Response.failure(res, {response: {},
          message:  `No record with id ${id} found`},
        httpCode.NOT_FOUND)
      }
    } catch(error){
      logger.info(`Single Contact Fetch Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Single Contact Fetch Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async unSubscribeSubcriberById(req,res){
    const {id} = req.params;
    if(JSON.stringify(req.query) != '{}'){
      return Response.failure(res, {
        response: {},
        message:  "No Body Allowed! pls pass only id as path param!"
      },
      httpCode.BAD_REQUEST);
    }
    try{
      const subscriber =
      await ContactService.ContactListService.getSingleContactDetails({_id: id});
      if(subscriber && subscriber.status === 'subscribed'){
        const updatedContact =
        await ContactService.ContactListService.updateContactDetails({_id: id},
          {
            status: 'unsubscribed'
          });
        if(updatedContact){
          const adminDetails = {
            email:       subscriber.email,
            action:      'NewsLetter UnSubscrpition Successful',
            description: 'None'
          }

          await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
          return Response.success(res, {response: updatedContact,
            message:  "Contact has successfully unsubscribed"},
          httpCode.OK)
        }
      }
      return Response.failure(res, {response: {},
        message:  "Contact already Unsubscribed!"},
      httpCode.CONFLICT)
    } catch(error){
      logger.info(`Unsubcribe Contact Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Unsubcribe Contact Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteSubscriberById(req, res){
    const {id} = req.params;

    try{
      const subscriber = await ContactService.ContactListService.getSingleContactDetails({_id: id});
      if(subscriber && subscriber.isDeleted === false){
        const deletedUser = await ContactService.ContactListService.updateContactDetails({_id: id}, {isDeleted: true});
        if(deletedUser){
          const adminDetails = {
            email:       subscriber.email,
            action:      'Successful NewsLetter Subscriber Deletion',
            description: 'None'
          }

          await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
          return Response.success(res, {response: deletedUser,
            message:  "Contact deleted successfully!"},
          httpCode.DELETED)
        }
      } else if(subscriber && subscriber.isDeleted === true){
        return Response.failure(res, {response: {},
          message:  "Already Deleted!"},
        httpCode.CONFLICT)
      } else {
        return Response.failure(res, {response: {},
          message:  "Contact Not Found!"},
        httpCode.NOT_FOUND)
      }

    } catch(error){
      logger.info(`Delete Contact Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Delete Contact Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new User();
