"use strict";

const jwt = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};

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

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1.Check userID
        2. get accessToken
        3. verifyToken
        4. check user in bds
        5. check keyStore with this userId
        6. OK all => return next()
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    //2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not Found keyStore");

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");
});

module.exports = {
    createTokenPair,
};
