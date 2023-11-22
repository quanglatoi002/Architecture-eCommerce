"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

// Declare the Schema of the Mongo model
const cartSchema = new Schema(
    {
        cart_state: {
            type: String,
            require: true,
            enum: ["active", "completed", "failed", "pending"],
            default: "active",
        },
        cart_products: { type: Array, required: true, default: [] },
        /*
            [
                {
                    productId,
                    shopId,
                    quantity,
                    name,
                    price,
                }
            ]
        */
        cart_count_product: { type: Number, default: 0 },
        cart_userId: { type: Number, required: true },
    },
    {
        collection: COLLECTION_NAME,
        timeseries: {
            createdAt: "createdOn",
            updatedAt: "modified",
        },
    }
);

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema),
};
