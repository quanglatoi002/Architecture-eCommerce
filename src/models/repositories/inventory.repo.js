const { convertToObjectMongodb } = require("../../utils");
const inventory = require("../inventory.model");

const insertInventory = async ({
    productId,
    shopId,
    stock,
    location = "unKnow",
}) => {
    return await inventory.create({
        invent_productId: productId,
        invent_stock: stock,
        invent_location: location,
        invent_shopId: shopId,
    });
};

// check xem hàng tồn kho có lớn hơn số lượng đặt hàng ko?
const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
            invent_productId: productId,
            invent_stock: { $gte: quantity },
        },
        updateSet = {
            $inc: {
                invent_stock: -quantity,
            },
            $push: {
                invent_reservations: {
                    quantity,
                    cartId,
                    createOn: new Date(),
                },
            },
        },
        options = { upsert: true, new: true };

    return await inventory.updateOne(query, updateSet);
};

module.exports = {
    insertInventory,
    reservationInventory,
};
