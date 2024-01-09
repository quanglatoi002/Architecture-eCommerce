"use strict";

const { BadRequestError } = require("../core/error.response");
const {
    product,
    clothing,
    electronic,
    furniture,
} = require("../models/product.model");

// Factory class to create product

/*
    1. call ProductFactory.createProduct(req.body.product_type, req.body)
    2. thì switch(type)case(Clothing) được chọn và return new Clothing(payload).createProduct()
    -> ở class Clothing ch khởi tạo constructor riêng cho class "Clothing", vì vậy nó sẽ sử dụng contructor của class cha("Product") do nó đã kế thừa từ Product. Ch hết we còn ph gọi .createProduct() của cả 2 lớp

*/

// Ở đây chúng ta đã biết có 3 đối tượng Clothing, Electronics, Furniture nhưng mà chúng ta không biết được đối tượng nào sẽ call để tạo ra cho nên chúng ta sẽ áp dụng PACTORY PATTERN như đúng định nghĩa của nó. ý2 Mục đích của pactory là định nghĩa(sử dụng static) ra 1 giao diện để tạo 1 đối tượng, nhưng việc tạo đối tượng này được xử lý bởi lớp các lớp.

// ở phần create product sẽ áp dụng strategy và pactory
class ProductFactory {
    //strategy sẽ tập hợp các các class con lại và đóng gói chúng và có thể thay đổi mà ko ảnh hưởng tới user
    //begin strategy
    static productRegistry = {}; // key-class

    //registerProductType(type, classRef) tk này sẽ nhận 2 tham số vd registerProductType("Electronics", Electronics(là 1 class))
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
        // const a = {
        //     Electronics: Electronics,
        //     Clothing: Clothing,
        // };
    }
    //end
    // sử dụng static để định nghĩa
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]; // lấy ra đc class dựa theo key
        // khi mà nhập type đúng thì nó sẽ trả về value là Clothing mà Clothing lại là 1 class cho nên ở khúc cuối tôi đã dùng return new chứ không return
        if (!productClass)
            throw new BadRequestError(`Invalid Product Types ${type}`);

        return new productClass(payload).createProduct();
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
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}

// Define sun-class for different product types Clothing

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

// Define sun-class for different product types Electronics
// we muốn ở tk electronics con ph trùng _id với product(cha)
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic)
            throw new BadRequestError("create new Electronics error");

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

//furniture
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError("create new Furniture error");

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

//register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
