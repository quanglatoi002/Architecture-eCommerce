"use strict";

const jwt = require("jsonwebtoken");
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //accessToken
        //use privateKey làm mã key
        const accessToken = await jwt.sign(payload, privateKey, {
            expiresIn: "2 days",
        });
        //refreshToken
        const refreshToken = await jwt.sign(payload, privateKey, {
            expiresIn: "7 days",
        });
        //
        jwt.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log("error verify::", err);
            } else {
                console.log("decode verify::", decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
};

module.exports = {
    createTokenPair,
};
