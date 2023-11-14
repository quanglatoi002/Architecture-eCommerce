"use strict";
//Sử dụng simple factory pattern
const mongoose = require("mongoose");
const {
    db: { host, port, name },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;
console.log(connectString);
//take quantity
const { countConnect } = require("../helpers/check.connect");
console.log(port);
class Database {
    constructor() {
        this.connect();
    }
    connect(type = "mongodb") {
        //1 1 mtruong dev
        if (1 === 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }
        //connect
        //maxPoolSize: 50 có nghĩa là tối đa số lượng truy cập
        mongoose
            .connect(connectString, {
                maxPoolSize: 50,
            })
            .then((_) => console.log("Connected Mongodb Success"))
            .catch((err) => console.log("Error Connecting!"));
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
