const logger                 = require('../lib/logger');
const Response               = require('../commons/responses');
const httpCode               = require('../commons/httpCode');
const PackageService         = require('../services/packages');
const UserService            = require('../services/users');
const Sentry                 = require("../lib/sentry");
const {upload, getImageUrls} = require("./helper");
const utils                  = require('../lib/utils');

class Package extends PackageService{
  async createFlightPackage(req, res){
    const {name} = req.body;

    try{
      const flightPackage = await this.getSinglePackageDetails({name});

      if(flightPackage){
        return Response.failure(res, {response: {},
          message:  "Package already Exists!"},
        httpCode.CONFLICT)
      }
      req.body.userId          = req.user.id;
      req.body.flightPackageId = utils.generateFlightPackageId();
      const newFlightPackage   = {...req.body};
      const savedFlightPackage = await this.addPackage(newFlightPackage);
      const user               = await new UserService().getSingleUserDetails({_id: req.user.id});
      if(savedFlightPackage){
        const adminDetails = {
          email:       user.email,
          action:      'Successful Package Creation',
          description: name
        }

        await new UserService().prepareAdminNotificationMailAndSend(adminDetails);
        return Response.success(res, {response: savedFlightPackage,
          message:  "Sucessfully saved Flight Package Content"},
        httpCode.ACCEPTED)
      } else {
        logger.error('Failed to Flight Package Content');
        return Response.failure(res, {response: {},
          message:  "Unexpected Error Occured"},
        httpCode.NOT_IMPLEMENTED)
      }
    } catch(error){
      logger.error(`Flight Package Creation Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Package Content Creation Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }

  }

  async updateFlightPackage(req, res){
    const {name} = req.body;
    if(!name){
      return Response.failure(res, {response: {}, message: "name is a mandatory field!"}, httpCode.UNPROCESSED_ENTITY)
    }
    try{
      const updatedPackage = await this.updatePackage({name}, req.body);
      if(updatedPackage){
        return Response.success(res, {response: updatedPackage, message: "Text Content Updated Successfuly!"})
      }
    } catch(error){
      logger.error(`Flight Package Text-Content Update Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Package Text-Content Update Error!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async uploadImages(req, res){
    upload(req, res, async(e)=>{
      try{
        const {name} = req.body;
        if(!name){
          return Response.failure(res,
            {response: {},
              message:  "name is a mandatory field!"},
            httpCode.UNPROCESSED_ENTITY)
        }
        if(!req.files){
          return Response.failure(res, {response: {},
            message:  "Files expected on this Route!"},
          httpCode.BAD_REQUEST)
        }

        if(!req.files[ 'header' ] || !req.files[ 'footer1' ] || !req.files[ 'footer2' ]
        || !req.files[ 'footer3' ] || !req.files[ 'footer4' ]){
          return Response.failure(res,
            {response: {},
              message:  "You may have missed either one of these [header, footer1, footer2, footer3]"},
            httpCode.BAD_REQUEST);
        }
        if(e){
          return Response.failure(res, { message: 'Error Uploading Image', response: e }, httpCode.BAD_REQUEST);
        }

        const uploadedUrls = await getImageUrls(req.files);

        const updatedPackage = await this.updatePackage({name: req.body.name}, {
          photos: uploadedUrls
        })
        if(updatedPackage){
          return Response.success(res, {response: updatedPackage, message: "Images Uploaded Successfully!"},
            httpCode.OK)
        }
      } catch(error){
        logger.error(`Flight Package Images Upload Error! ${error}`);
        Sentry.captureException(error);
        return Response.failure(
          res,
          { response: {}, message: "Flight Package Images Upload Error!!" },
          httpCode.INTERNAL_SERVER_ERROR
        );
      }

    })
  }

  async getFlightPackages(req, res){
    const {
      page, sort, limit,id
    } = req.query;

    const param = {};
    if(page) param.page = page;
    if(sort) param.sort = sort;
    if(limit) param.limit = limit;
    param.query      = {};
    let response;

    if(id){
      response = await this.getSinglePackageDetails({flightPackageId: id});
      return Response.success(res, {response,
        message: `Package with Id ${id} Fetched successfully!`},
      httpCode.OK);
    }
    response = await this.getAllPackageDetailsPaginated(param);
    if(response){
      return Response.success(res, { response, message: 'All Flight Packages fetched successfully',
        count:   Array.isArray(response.docs)? response.docs.length: 0
      }, httpCode.OK);
    }
  }

  async deleteFlightPackage(req, res){
    const {id} = req.params;
    if(!id){
      return Response.failure(res,
        {response: {},
          message:  "name is a mandatory field!"},
        httpCode.UNPROCESSED_ENTITY)
    }
    try{
      const flightPackage = await this.getSinglePackageDetails({flightPackageId: id});
      if(!flightPackage){
        return Response.failure(res, {response: {}, message: "Flight Package Not Found!"},httpCode.NOT_FOUND)
      }
      await this.deletePackage({flightPackageId: id});
      return Response.success(res, {response: {}, message: "Flight package Deleted Successfully!"}, httpCode.DELETED)
    } catch(error){
      logger.error(`Flight Package Delete Error! ${error}`);
      Sentry.captureException(error);
      return Response.failure(
        res,
        { response: {}, message: "Flight Package Delete Error!!" },
        httpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

}
module.exports = new Package();