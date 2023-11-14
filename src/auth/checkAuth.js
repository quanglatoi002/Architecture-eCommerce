"use strict";

const { findById } = require("../services/apikey.service");

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }
        //check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }
        req.objKey = objKey;
        return next();
    } catch (error) {}
};

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }
        const validPermissions = req.objKey.permissions.includes(permission);
        if (!validPermissions) {
            return res.status(403).json({
                message: "permission denied",
            });
        }
        return next();
    };
};

// mục đích chính là bọc 1 hàm xử lý ko đồng bộ async để tự động xử lý lỗi. Khi hàm fn(req,res,next) được gọi, nó sẽ kiểm soái bất kì lỗi nào xảy ra trg qtrinh thực thi hàm fn và chuyển nó đến midd next tiếp theo.
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    apiKey,
    permission,
    asyncHandler,
};
