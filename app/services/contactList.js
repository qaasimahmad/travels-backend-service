const MongoDBHelper    = require(".");
const logger           = require("../lib/logger");
const ContactListModel = require("../models/contactList");
const mailchimp        = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PARAM,
});

class ContactListService{
  constructor(){
    this.mongoUser = new MongoDBHelper(ContactListModel);
  }

  async addContact(data){
    return this.mongoUser.save(data);
  }

  async getSingleContactDetails(param){
    logger.info(`getSingleContactDetails... ${param}`);
    return this.mongoUser.get(param);
  }
  async getAllContactDetails(param){
    logger.info(`getAllListDetails... ${param}`);
    return this.mongoUser.getBulk(param);
  }
  async getAllListPaginated(param){
    logger.info(`getPaginatedList... ${JSON.stringify(param)}`);
    return this.mongoUser.getBulkPaginated(param);
  }

  async updateContactDetails(params, data){
    logger.info("Updating Contact List..");
    return this.mongoUser.update(params, data)
  }

  //   async addContactsToList(listId, members){
  //     logger.info(`Got Members ${listId}->${members}`);
  //     const memberDetails = members.map((member)=>{
  //       return {
  //         email_address:    member,
  //         email_type:       'html',
  //         status:           'subscribed',
  //         timestamp_signup: this.getCurrentDate(),
  //         update_existing:  true
  //       }
  //     });

  //     try{
  //       const addedMembers  = await mailchimp.lists.batchListMembers(listId, {
  //         members: [ {
  //           email_address:    "",
  //           email_type:       'html',
  //           status:           'subscribed',
  //           timestamp_signup: this.getCurrentDate(),
  //           update_existing:  true
  //         } ],
  //       });

  //       //const savedMembers;
  //       const contactDetailsToSave = memberDetails.map((member)=>{
  //         return {
  //           email:           member.email_address,
  //           status:          member.status,
  //           timeStampSignUp: member.timestamp_signup
  //         }
  //       });

  //       return this.mongoUser.saveBulk(contactDetailsToSave);
  //     } catch(error){
  //       logger.error('Error-Encountered', error);
  //       return error;
  //     }
  //   }

  getCurrentDate(){
    const nowDate = new Date().getTime();
    const date    = new Date(nowDate);

    return date.toISOString();
  }

}
module.exports = {
  mailchimp,
  ContactListService: new ContactListService()
};