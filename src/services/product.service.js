"use strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic } = require("../models/product.model");

// Factory class to create product

/*
    1. call ProductFactory.createProduct(req.body.product_type, req.body)
    2. thì switch(type)case(Clothing) được chọn và return new Clothing(payload).createProduct()
    -> ở class Clothing ch khởi tạo constructor riêng cho class "Clothing", vì vậy nó sẽ sử dụng contructor của class cha("Product") do nó đã kế thừa từ Product. Ch hết we còn ph gọi .createProduct() của cả 2 lớp

*/

class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case "Electronic":
                return new Electronics(payload).createProduct();
            case "Clothing":
                return new Clothing(payload).createProduct();
            default:
                throw new BadRequestError(`Invalid Product type ${type}`);
        }
    }
}

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_type,
        product_shop,
        product_attributes,
        product_quantity,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
        this.product_quantity = product_quantity;
    }

    //create new product
    async createProduct() {
        return await product.create(this);
    }
}

// Define sun-class for different product types Clothing

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing)
            throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct();
        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

// Define sun-class for different product types Electronics

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create(this.product_attributes);
        if (!newElectronic)
            throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct();
        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

module.exports = ProductFactory;
