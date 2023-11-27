"use strict";

const { SuccessResponse } = require("../core/success.response");
const InventoryService = require("../services/inventory.service");

/**
 * @desc add to cart for user
 * @param {int} userId
 * @param {*} res
 * @param {*} next
 * @method POST
 * @url /v1/api/inventory
 */

class InventoryController {
    addStockToInventory = async (req, res, next) => {
        //new
        new SuccessResponse({
            message: "Create new Cart successfully",
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };
}

module.exports = new InventoryController();
