"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

/**
 * @desc add to cart for user
 * @param {int} userId
 * @param {*} res
 * @param {*} next
 * @method POST
 * @url /v1/api/cart/user
 */

class CartController {
    addToCart = async (req, res, next) => {
        //new
        new SuccessResponse({
            message: "Create new Cart successfully",
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };
    //update
    update = async (req, res, next) => {
        //new
        new SuccessResponse({
            message: "Update new Cart successfully",
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    };
    //delete
    delete = async (req, res, next) => {
        //new
        new SuccessResponse({
            message: "deleted Cart successfully",
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };
    //delete
    listToCart = async (req, res, next) => {
        //new
        new SuccessResponse({
            message: "List Cart successfully",
            metadata: await CartService.getListUserCart(req.query),
        }).send(res);
    };
}

module.exports = new CartController();
