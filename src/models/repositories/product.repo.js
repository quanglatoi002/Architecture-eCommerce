"use strict";

const { Types } = require("mongoose");
const {
    product,
    electronic,
    clothing,
    furniture,
} = require("../product.model");
const { getSelectData, unGetSelectData } = require("../../utils");
const { get } = require("lodash");

// nó đại diện cho cụm từ async await
const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

//fulltext search
const searchProductByUser = async ({ keySearch }) => {
    //
    const regexSearch = new RegExp(keySearch);
    const results = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            //sắp xếp cụm từ gần chính xác giá trị search nhất
            { score: { $meta: "textScore" } }
        )
        .sort({
            score: { $meta: "textScore" },
        })
        .lean();

    return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    // 1-50 / 51/100 / 101/150
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();

    return products;
};

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect));
};

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true,
}) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew });
};

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

const getProductById = async (productId) => {
    return await product.findOne({ _id: productId }).lean();
};

const checkProductByServer = async (products) => {
    console.log("bbbbbbbbbbb", products);
    return await Promise.all(
        products.map(async (product) => {
            console.log("ccc", product);
            const foundProduct = await getProductById(product.productId);
            if (foundProduct) {
                return {
                    price: foundProduct.product_price,
                    quantity: product.quantity,
                    productId: product.productId,
                };
            }
        })
    );
};

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
};
