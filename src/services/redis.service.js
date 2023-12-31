"use strict";

const { createClient } = require("redis");
const { promisify } = require("node:util");
const {
    reservationInventory,
} = require("../models/repositories/inventory.repo");
const redisClient = createClient();

// redisClient.on("connect", () => {
//     console.log("Connected to Redis");
// });

redisClient.ping((err, result) => {
    if (err) {
        console.log("Error connecting to Redis::", err);
    } else {
        console.log("Connected to Redis");
    }
});

const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

// khi mà user đang thanh toán thì giữ lại ko cho ngkac thanh toán nữa. Nếu mà có ng khác vào thì nó sẽ thử 10 lần(khóa lạc quan)
const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retrtTimes = 10;
    const expireTime = 3000; // 3 seconds tam lock

    for (let index = 0; index < retrtTimes.length; index++) {
        // tạo key, tk nao nam giu dc vao thanh toan
        const result = await setnxAsync(key, expireTime);
        if (result === 1) {
            //thao tác với inventory
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId,
            });
            // result trả về của updateOne{NUMBER(modifiedCount), ...}
            if (isReservation.modifiedCount) {
                await pexpire(key, expireTime);
                return key;
            }

            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
};

const releaseLock = async (keyLock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey(keyLock);
};

module.exports = {
    acquireLock,
    releaseLock,
};
