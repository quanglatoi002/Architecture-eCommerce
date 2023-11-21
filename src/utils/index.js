"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const convertToObjectMongodb = (id) => {
    Types.ObjectId(id);
};
// trích xuất dữ liệu
const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds);
};

// ['a', 'b] => {a:1, b:1} số 1 tương đương là lấy
const getSelectData = (select = []) => {
    return Object.fromEntries(select?.map((el) => [el, 1]));
};
// số 0 là ko lấy
const unGetSelectData = (select = []) => {
    return Object.fromEntries(select?.map((el) => [el, 0]));
};

//
const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach((k) => {
        if (obj[k] === null && obj[k] === undefined) {
            delete obj[k];
        }
    });
    return obj;
};

/* 
    const a = {
        c: {
            d: 1, 
            e: 2
        }
    }
*/
const updateNestedObjectParser = (obj) => {
    const final = {};
    Object.keys(obj).forEach((k) => {
        if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k]);
            Object.keys(response).forEach((a) => {
                final[`${k}.${a}`] = response[a];
            });
        } else {
            final[k] = obj[k];
        }
    });
    return final;
};

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectMongodb,
};
