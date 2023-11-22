"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodesSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");

class DiscountService {
    // create  discount code from Shop
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            users_used,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;
        //check
        // if (
        //     new Date() < new Date(start_date) ||
        //     new Date() > new Date(end_date)
        // ) {
        //     throw new BadRequestError("Discount code has expired");
        // }

        if (new Date(start_date) >= new Date(end_date))
            throw new BadRequestError("Start date must be before end date");
        // create index discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount exists ");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode() {}

    static async getAllDiscountCodesWithProduct({
        code,
        shopId,
        userId,
        limit,
        page,
    }) {
        //create index for discount_code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: shopId,
            })
            .lean();

        if (foundDiscount && !foundDiscount.discount_is_active) {
            throw new NotFoundError("discount not exists");
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === "all") {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: shopId,
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        if (discount_applies_to === "specific") {
            //get all product
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }
        return products;
    }

    // get all discount code of Shop

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: shopId,
                discount_is_active: true,
            },
            select: ["discount_code", "discount_name"],
            model: discount,
        });

        return discounts;
    }

    /*
        Apply Discount Code
        products = [
            {
                productId
                shopId,quantity,
                name, price
            }
            {
                productId
                shopId,quantity,
                name, price
            }
            
        ]

    */
    //giá tiền sau khi áp dụng dis count
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
            },
        });

        if (!foundDiscount) throw new NotFoundError(`discount does't exist`);

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_order_value,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value,
        } = foundDiscount;
        // nếu có nhưng discount để hết hạn thì ph chuyển tk false
        if (!discount_is_active) throw new NotFoundError(`discount expired`);
        if (!discount_max_uses) throw new NotFoundError(`discount are out`);

        if (
            new Date() < new Date(discount_start_date) ||
            new Date() > new Date(discount_end_date)
        ) {
            throw new NotFoundError("discount code has expired");
        }
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            //get total
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(
                    `discount requires a minimum order value of ${discount_min_order_value} `
                );
            }
        }
        // sl tối đa user có thể sử dụng mặc định là 1
        if (discount_max_uses_per_user > 0) {
            const usedUserDiscount = discount_users_used.find(
                (user) => user.userId === userId
            );
            if (usedUserDiscount)
                throw new BadRequestError("each user can only used once");
        }

        //check discount_type là gì?
        // amount số tiền được giảm sau khi áp dụng mã giảm giá
        const amount =
            discount_type === "fixed_amount"
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        // kiểm tra xem trog db có discount code ko?
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
            },
        });

        if (!foundDiscount) throw new NotFoundError(`discount does't exist`);
        // ko có thì xóa
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: shopId,
        });
        return deleted;
    }

    // user cancel discount code
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: shopId,
            },
        });

        if (!foundDiscount) throw new NotFoundError(`discount does't exist`);

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });

        return result;
    }
}
module.exports = DiscountService;
