"use strict";

const { cart } = require("../models/cart.model");
const {
    findAllProducts,
    getProductById,
} = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");

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

    //update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId,
                    }
                ]
                version
            }
        ]
    */
    static async addToCartV2({ userId, product = {} }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_product[0];
        //check product
        const fountProduct = await getProductById(productId);
        if (!fountProduct) throw new NotFoundError("Product not exist");
        if (fountProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
            throw new NotFoundError("Product do not belong to the shop");
        if (quantity === 0) {
            //delete
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    // user xóa sản phẩm trong cart của mình
    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: "active" },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            };
        const deleteCart = await cart.updateOne(query, updateSet);
    }
}

module.exports = CartService;
