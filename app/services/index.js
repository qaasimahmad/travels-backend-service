const logger                             = require("../lib/logger");
const {omitAirportsItems, omitUserItems} =require("../commons/mongoOmitObjects");

class MongoDBHelper{
  /**
   * The constructor
   * @param mongodbModel - the model you wish to operate on
   */
  constructor(mongodbModel){
    this.mongodbModel = mongodbModel;
  }

  /**
   * Fetches a single record from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  get(params){
    return new Promise((resolve, reject) => {
      const param = params.query || params;
      const query = this.mongodbModel.findOne(param);

      if(params.fields){
        query.select(params.fields);
      }

      return query.exec((err, modelData) => {
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      });
    });
  }
  /**
   * Fetches the count of documents in a Model from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getCount(params){
    return new Promise((resolve, reject)=>{
      const query  = this.mongodbModel.find(params).count();

      return query.exec((err, modelData) => {
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      });
    })
  }

  /**
   * Fetches a single User record from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getUser(params){
    return new Promise((resolve, reject) => {
      const param = params.query || params;
      const query = this.mongodbModel.findOne(param).populate('bookingId');
      if(params.fields){
        query.select(params.fields);
      }

      return query.exec((err, modelData) => {
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      });
    });
  }

  /*
  Perfrom Full Text Search on Airports Collection
  */
  getAirportsMetaData(param){
    return new Promise((resolve, reject)=>{
      const query = this.mongodbModel.find( { $text: { $search: param } });

      query.projection(omitAirportsItems);

      return query.exec((err, modelData) =>{
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      })
    })
  }

  /**
   * Fetches a single record from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getSorted(param){
    return new Promise((resolve, reject) => {
      const query = this.mongodbModel.find({
        $query:   param,
        $orderby: { createdAt: -1 },
      });

      return query.exec((err, modelData) => {
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      });
    });
  }

  /**
   * Fetches bulk records with pagination from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getBulkPaginated(params){
    try{
      if(params !== undefined){
        const {
          page = params.page || 1,
          sort,
          limit = params.limit || 15,
          query,
          select = "",
        }                = params;

        query.projection = omitUserItems;

        return this.mongodbModel.paginate(query, {
          select: `${select}`,
          sort,
          page,
          limit:  parseInt(limit, 0),
        });
      }
      return this.mongodbModel.find();
    } catch(e){
      return logger.info("error", e);
    }
  }

  /**
   * Fetches bulk records from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getBulk(params){
    return new Promise((resolve, reject) => {
      const parameter = params;

      const query =
        params === undefined
          ? this.mongodbModel.find()
          : this.mongodbModel.find(parameter.conditions);

      if(params && parameter.fields){
        query.select(params.fields);
      }

      if(params && parameter.sort){
        query.sort(parameter.sort);
      }

      return query.exec((error, modelData) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(modelData);
      });
    });
  }

  /**
   * Fetches bulk Users records from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getBulkUsers(params){
    return new Promise((resolve, reject) => {
      const parameter = params;
      let limit;
      let page;
      if(params.limit){
        limit = params.limit || 20;
      }
      if(params.page){
        page = params.page || 0;
      }

      const query =
          params === undefined
            ? this.mongodbModel.find().skip(page).limit(limit)
            : this.mongodbModel.find(parameter.conditions).skip(page).limit(limit);

      if(params && parameter.fields){
        query.select(params.fields);
      }

      if(params && parameter.sort){
        query.sort(parameter.sort);
      }
      query.projection = omitUserItems;


      return query.exec((error, modelData) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(modelData);
      });
    });
  }

  /**
   * Fetches All records (based on Date) from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */

  getBulkByDate(params){
    return new Promise((resolve, reject)=>{
      let limit;
      let page;
      if(params.limit){
        limit = params.limit || 20;
      }
      if(params.page){
        page = params.page || 0;
      }
      const query = typeof(params) === 'number'
        ? this.mongodbModel.aggregate([
          { $match: {
            $expr: {
              $gt: [
                "$createdAt",
                { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: params } }
              ]
            }
          }}
        ]): this.mongodbModel.find({ createdAt: { $gte: params.dateRange[ 0 ], $lte: params.dateRange[ 1 ] } })
          .skip(page).limit(limit)

      return query.exec((error, modelData) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(modelData);
      });
    });
  }

  /**
   * Fetches Total Transaction value across all Bookings from the connected MongoDB instance.
   *
   * @param params
   * @returns {Promise}
   */
  getAllBookingRevenueByDate(params){
    return new Promise((resolve,reject)=>{
      const query = params.date
        ? this.mongodbModel.aggregate([
          { $match: {
            $expr: {
              $gt: [
                "$createdAt",
                { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: params } }
              ]
            }
          }},
          {
            $group: {
              _id:        params.id,
              totalSpend: {
                $sum: "$grandTotal"
              },
              count: {
                $sum: 1
              }
            }
          },
          {
            $sort: {totalSpend: -1}
          }
        ]): this.mongodbModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: params.dateRange[ 0 ],
                $lte: params.dateRange[ 1 ]
              }
            }
          },
          {
            $group: {
              _id:        params.id,
              totalSpend: {
                $sum: "$grandTotal"
              },
              count: {
                $sum: 1
              }
            }
          },
          {
            $sort: {totalSpend: -1}
          }
        ]);

      return query.exec((error, modelData) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(modelData);
      });
    })
  }

  getAllBookingRevenue(){
    return new Promise((resolve, reject)=>{
      const query = this.mongodbModel.aggregate(
        [
          {
            $group: {
              _id:        null,
              totalSpend: {
                $sum: "$grandTotal"
              }
            }
          }
        ]
      )

      return query.exec((error, modelData) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(modelData);
      });
    })
  }

  /**
   * Saves data into the MongoDB instance
   *
   * @param data
   * @returns {Promise}
   */
  save(data){
    return new Promise((resolve, reject) => {
      const mongodbSaveSchema = this.mongodbModel(data);

      return mongodbSaveSchema.save((error, result) => {
        if(error != null){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(result);
      });
    });
  }

  /**
   * Saves bulk data into the MongoDB instance
   *
   * @param data of Array
   * @returns {Promise}
   */
  saveBulk(data){
    return new Promise((resolve, reject) =>
      this.mongodbModel.insertMany(data, (error, result) => {
        if(error != null){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(result);
      })
    );
  }

  /**
   * Updates a SINGLE RECORD in the MongoDB instance's DB based on some conditional criteria
   *
   * @param params - the parameters
   * @returns {Promise}
   */
  search(params){
    return new Promise((resolve, reject) => {
      const query     = this.mongodbModel.find(params.q);
      const parameter = params;

      if(params && parameter.fields){
        query.select(params.fields);
      }

      if(params && parameter.populate){
        query.populate(parameter.populate.path, parameter.populate.field);
      }

      if(params.fields){
        query.select(params.fields);
      }

      return query.exec((err, modelData) => {
        if(err){
          return reject(MongoDBHelper.handleError(err));
        }
        return resolve(modelData);
      });
    });
  }

  update(params, data){
    return new Promise((resolve, reject) =>
      this.mongodbModel.findOneAndUpdate(
        params,
        { $set: data },
        { new: true },
        (error, response) => {
          if(error){
            return reject(MongoDBHelper.handleError(error));
          }
          if(error == null && response == null){
            return reject(MongoDBHelper.handleError("Record Not Found In DB"));
          }
          return resolve(response);
        }
      )
    );
  }

  updateUsersFlightPackages(params, data){
    return new Promise((resolve, reject) =>
      this.mongodbModel.findOneAndUpdate(
        params,
        { $push: data },
        { new: true },
        (error, response) => {
          if(error){
            return reject(MongoDBHelper.handleError(error));
          }
          if(error == null && response == null){
            return reject(MongoDBHelper.handleError("Record Not Found In DB"));
          }
          return resolve(response);
        }
      )
    );
  }

  updateOrCreate(params, data){
    return new Promise((resolve, reject) =>
      this.mongodbModel.findOneAndUpdate(
        params,
        { $set: data },
        { upsert: true },
        (error, response) => {
          if(error){
            return reject(MongoDBHelper.handleError(error));
          }
          return resolve(response);
        }
      )
    );
  }

  increment(params, data){
    return new Promise((resolve, reject) =>
      this.mongodbModel.findOneAndUpdate(
        params,
        { $inc: data },
        { new: true },
        (error, response) => {
          if(error){
            return reject(MongoDBHelper.handleError(error));
          }
          if(error == null && response == null){
            return reject(MongoDBHelper.handleError("Record Not Found In DB"));
          }
          return resolve(response);
        }
      )
    );
  }

  /**
   * Delete MULTIPLE RECORDS from the MongoDB instance's DB based on some conditional criteria
   *
   * @param params - the conditional parameters
   * @returns {Promise}
   */
  deleteBulk(params){
    return new Promise((resolve, reject) =>
      this.mongodbModel.remove(params.conditions, (error, response) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(response);
      })
    );
  }

  deleteOne(params){
    return new Promise((resolve, reject) =>
      this.mongodbModel.deleteOne(params, (error, response) => {
        if(error){
          return reject(MongoDBHelper.handleError(error));
        }
        return resolve(response);
      })
    );
  }

  /**
   * Used to format the error messages returned from the MongoDB server during CRUD operations
   *
   * @param report
   * @returns {{error: boolean, message: *}}
   */
  static handleError(report){
    return { error: true, msg: report };
  }
}

module.exports = MongoDBHelper;
