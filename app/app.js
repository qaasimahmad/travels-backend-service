require("dotenv").config();

const express = require("express");


const cors         = require("cors");
const routes       = require("./routes");
const errorHandler = require("./lib/requestErrorHandler");
const app          = express();
// const {client}     = require("./services/queues/index");
// const {mailchimp}  = require("./services/contactList");

app.use(cors());

app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json({limit: '50mb'}));


// mongo connection
require("./lib/mongo");
//require("./services/schedulers/reservationStatus");

// const run = async() => {
//   const response = await mailchimp.lists.getAllLists();
//   const listId   = response.lists[ 0 ].id;
//   const result   = await client.set("audienceList", listId);

//   console.log('ListId-Set-On-Init', result);
// };

// run();

app.get("/", async(req, res) => {
  res.status(200).send("GeoTravels is up and running");
});

// routes configuration
routes(app);

// error handling must be the last middleware
app.use(errorHandler);

module.exports = app;
