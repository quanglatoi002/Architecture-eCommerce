"use strict";

const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");

const router = express.Router();

router.get(
    "/search/:keySearch",
    asyncHandler(productController.getListSearchProduct)
);

//authentication//
router.use(authentication);
////////
router.post("", asyncHandler(productController.createProduct));
router.post(
    "/publish/:id",
    asyncHandler(productController.publicProductByShop)
);
router.post(
    "/unpublish/:id",
    asyncHandler(productController.unPublicProductByShop)
);

//QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
    "/published/all",
    asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
