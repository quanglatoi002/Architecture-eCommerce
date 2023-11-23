"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");

class CheckoutService {
    //login and without login
    /*
     {
        "cart",
        "userId",
        "shop_order_ids": [
            {
                shopId,
                shop_discount:[],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    
                }
                ]
            },
                {
                shopId,
                shop_discount:[
                    {
                        shopId,
                        "discountId"
                        "codeId"

                    }
                ],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    
                }
                ]
            },
        ]
     }
    */

    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        //check cartId axis?
        const fountCart = await findCartById(cartId);
        if (!fountCart) throw new BadRequestError("Cart does not exists!");

        const checkout_order = {
                totalPrice: 0, //tong tien hang
                freeShip: 0, // phi van chuyen
                totalDiscount: 0, //tong tien discount giam gia
                totalCheckout: 0, // tong thanh toan
            },
            shop_order_ids_new = [];

        // tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discount = [],
                item_products = [],
            } = shop_order_ids[i];
            //check product available
            // const checkProductServer = await
        }
    }
}

module.exports = new CheckoutService();
