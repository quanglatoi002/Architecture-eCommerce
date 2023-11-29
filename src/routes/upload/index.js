"use strict";

const multer = require("multer");
const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const updateController = require("../../controllers/upload.controller");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post(
    "/product/bucket",
    upload.single("file"),
    asyncHandler(updateController.uploadImageFromLocalS3)
);

module.exports = router;
