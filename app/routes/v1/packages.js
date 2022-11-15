const express              = require('express');
const route                = express.Router();
const { verifyTokenAdmin } = require("../../middleware/verifyToken");
const packageSchema        = require('../../lib/schemas/package');
const validator            = require('../../middleware/validator');

// used to enable catching and handling errors globally
const asyncHandler = require('express-async-handler');

const PackageController  = require('../../controllers/packages');

route.post('/addTextContent', validator(packageSchema),
  verifyTokenAdmin,
  asyncHandler((req, res) => PackageController.createFlightPackage(req, res)));

route.put(
  "/addImageContent",verifyTokenAdmin,
  asyncHandler((req, res) => PackageController.uploadImages(req, res))
);

route.put(
  "/updatePackageContent",verifyTokenAdmin,
  asyncHandler((req, res) => PackageController.updateFlightPackage(req, res))
);

route.get(
  "/getFlightPackages",
  asyncHandler((req, res) => PackageController.getFlightPackages(req, res))
);

route.delete(
  "/remove/:id",verifyTokenAdmin,
  asyncHandler((req, res) => PackageController.deleteFlightPackage(req, res))
);

module.exports = route;