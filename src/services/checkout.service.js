"use strict";

const { BadRequestError } = require("../core/error.response");
const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

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

    //order
    static async orderByUser({
        cartId,
        userId,
        shop_order_ids_new = [],
        user_address = {},
        user_payment = {},
    }) {
        const newCheckoutService = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids: shop_order_ids_new,
        });

        //check lại 1 lần nữa xem có vượt hàng tồn kho hay ko?
        //get new array Products
        const products = newCheckoutService.shop_order_ids_new.flatMap(
            (order) => order.item_products
        );
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            // result trả về của keyLock là string || null
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        //check if co 1 sp ht hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError(
                "Một số products đã được cập nhật, vui lòng quay lại giỏ hàng..."
            );
        }
        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: newCheckoutService.checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_product: newCheckoutService.shop_order_ids_new,
        });

        // if insert successfully, thì remove product have in cart
        if (newOrder) {
            //remove product in my cart
        }
        return newOrder;
    }

    static async getOrdersByUser() {}
    static async getOneOrderByUser() {}
    static async cancelOrderByUser() {}
    static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
