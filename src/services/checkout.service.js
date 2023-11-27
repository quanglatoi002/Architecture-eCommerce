"use strict";

const { BadRequestError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

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

        // đẻ tránh trg hợp bị can thiệp info product tc khi thanh toán thì ta cần phải check lại info sp
        const checkout_order = {
                totalPrice: 0, //tong tien hang
                freeShip: 0, // phi van chuyen
                totalDiscount: 0, //tong tien discount giam gia
                totalCheckout: 0, // tong thanh toan
            },
            shop_order_ids_new = [];

        /* 
            cần ph check lại giá của sp tc khi đặc hàng và xem sp nó còn ở thời điểm hiện tại ko?
         */
        // tinh tong tien bill
        for (let i = 0; i < shop_order_ids?.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];
            //check product available
            const checkProductServer = await checkProductByServer(
                item_products
            );

            /* 
                checkProductServer[
                    {
                        price, // mới được cập nhật lại
                        quantity, productId (cũ)
                    }
                ]    
            */

            if (!checkProductServer[0])
                throw new BadRequestError("order wrong!!!");
            // sum cart
            // tính lại giá so với bạn đầu
            console.log("checkProductServer", checkProductServer);
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            console.log("checkout priceeeeeeee", checkoutPrice);

            // tong tien pre khi xử lý
            checkout_order.totalPrice = +checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // pre money discount
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            // neu shop_discount ton tai > 0, check xem co hop le hay ko
            if (shop_discounts.length > 0) {
                //gia su chi co 1 discount
                //get amount discount
                const { totalPrice = 0, discount } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    shopId,
                    userId,
                    products: checkProductServer,
                });
                // sum giá tiền được giảm giá
                checkout_order.totalDiscount += discount;
                // nếu discount money > 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            //tong thanh toan
            checkout_order.totalCheckout = itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }
}

module.exports = CheckoutService;
