const MongoDBHelper = require(".");
const logger        = require("../lib/logger");
const PackageModel  = require("../models/packages");

class PackageService{
  constructor(){
    this.mongoUser = new MongoDBHelper(PackageModel);
  }

  async addPackage(data){
    logger.info(`Adding new Package...`);
    return this.mongoUser.save(data);
  }
  async getSinglePackageDetails(param){
    logger.info(`getSinglePackageDetails...${param}`);
    return this.mongoUser.get(param);
  }
  async getAllPackagesDetails(param){
    logger.info(`getAllPackagesDetails... ${param}`);
    return this.mongoUser.getBulkUsers(param);
  }
  async getAllPackageDetailsPaginated(param){
    logger.info(`getPaginatedPackage... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }

  async updatePackage(params, data){
    logger.info("Updating Package..");
    return this.mongoUser.update(params, data)
  }

  async deletePackage(params){
    logger.info("Deleting Package..");
    return this.mongoUser.deleteOne(params)
  }

}
module.exports = PackageService;