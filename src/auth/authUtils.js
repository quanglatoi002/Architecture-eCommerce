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
        const accessToken = await jwt.sign(payload, publicKey, {
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

    //1 lấy userID từ client
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    //2 tìm findOne với user: userId on model Keys
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not Found keyStore");

    //3
    //take accessToken
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    try {
        //verify token
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
        console.log(decodeUser);
        if (!userId === decodeUser.userId)
            throw new AuthFailureError("Invalid Userid");
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

module.exports = {
    createTokenPair,
    authentication,
};
