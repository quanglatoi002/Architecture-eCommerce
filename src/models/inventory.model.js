"use strict";

const { Schema, model, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
const inventorySchema = new Schema(
    {
        invent_productId: { type: Schema.Types.ObjectId, ref: "Product" },
        invent_location: { type: String, default: "unKnown" },
        invent_stock: { type: Number, require: true },
        invent_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
        invent_reservation: { type: Array, default: [] },
    },
    /*
        cartId:,
        stock: 1
        createOn:
     */
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
