"use strict";

const _ = require("lodash");

// trích xuất dữ liệu
const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds);
};

module.exports = {
    getInfoData,
};
