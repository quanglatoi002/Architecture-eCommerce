"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
    {
        discount_name: { type: String, required: true },
        discount_description: { type: String, required: true },
        discount_type: { type: String, default: "fixed_amount" }, // giảm giá theo số tiền
        discount_code: { type: String, required: true }, // mã giảm giá
        discount_value: { type: Number, required: true }, // 10.000d
        discount_max_value: { type: Number, required: true },
        discount_start_date: { type: Date, required: true }, // ngày bd
        discount_end_date: { type: Date, required: true }, // ngày kthuc
        discount_max_uses: { type: Number, required: true }, //so luong discount dc ap dung
        discount_uses_count: { type: Number, required: true }, // so discount da su dug
        discount_users_used: { type: Array, required: true }, // ai su dung
        discount_max_uses_per_user: {
            type: Number,
            required: true,
        }, // SL allowed maximum đc use cho mỗi user
        discount_min_order_value: {
            type: Number,
            required: true,
        },
        discount_shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        discount_is_active: { type: Boolean, required: true },
        discount_applies_to: {
            type: String,
            required: true,
            enum: ["all", "specific"],
        },
        discount_product_ids: {
            type: Array,
            default: [],
        }, // so sp đc allow
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
