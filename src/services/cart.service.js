"use strict";

const { cart } = require("../models/cart.model");
const { convertToObjectMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { options } = require("../routes");
const { update } = require("lodash");

/*
    1 - add product to Cart [User]
    2 - Reduce product quantity [User]
    3 - Increase product quantity [User]
    4 - Get list to Cart [User]
    5 - Delete cart [User]
    6 - Delete cart item [User] 
*/

class CartService {
    /// REPO CART
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product,
                },
            },
            //upsert viết tắt của update và insert
            options = { upsert: true, new: true };

        // addToSet chỉ khi tìm kiếm đúng với đk đề ra thì ms được thêm zo
        return await cart.findByIdAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
                cart_userId: userId,
                "cart_products.productId": productId,
                cart_state: "active",
            },
            updateSet = {
                $inc: {
                    "cart_products.$.quantity": quantity,
                },
            },
            options = { upsert: true, new: true };

        return await cart.findByIdAndUpdate(query, updateSet, options);
    }
    /// END

    static async addToCart({ userId, product = {} }) {
        //check cart exists hay ko?
        const userCart = await cart.findOne({ cart_userId: userId });
        // ch có cart
        if (!userCart) {
            //create cart for User
            return await CartService.createUserCart({ userId, product });
        }
        // co cart nhưng ch có product
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save(); // cập nhật lại product
        }

        // gio hang ton tai, va co san phm nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product });
    }
}

module.exports = CartService;
