"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
    //logout
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new Product success!",
            metadata: await ProductService.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    //update product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Update Product success!",
            metadata: await ProductService.updateProduct(
                req.body.product_type,
                req.params.productId,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publicProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "publishProductByShop success!",
            metadata: await ProductService.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    unPublicProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "unPublishProductByShop success!",
            metadata: await ProductService.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };
    /**
     * @desc Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON} res
     */

    //QUERY
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Draft success!",
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list getAllPublishForShop success!",
            metadata: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list getListSearchProduct success!",
            metadata: await ProductService.searchProducts(req.params),
        }).send(res);
    };

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list findAllProducts success!",
            metadata: await ProductService.findAllProducts(req.query),
        }).send(res);
    };

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list findProduct success!",
            metadata: await ProductService.findProduct({
                product_id: req.params.product_id,
            }),
        }).send(res);
    };

    //END QUERY
}

module.exports = new ProductController();
