"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

// Declare the Schema of the Mongo model
const orderSchema = new Schema(
    {
        order_userId: { type: Number, required: true },
        order_checkout: { type: Object, default: {} },
        /*
            order_checkout = {
                totalPrice,
                totalApplyDiscount,
                feeShip
                ...
            }
         */
        order_shipping: { type: Object, required: true },
        order_payment: { type: Object, required: true },
        order_tracking: { type: String, default: "#000270112023" },
        order_status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "cancelled"],
            default: ["pending"],
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "modified",
        },
    }
);

//Export the model
module.exports = {
    order: model(DOCUMENT_NAME, orderSchema),
};
