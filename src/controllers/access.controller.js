"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
    //logout
    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Get token success!",
            metadata: await AccessService.handlerRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    };
    //logout
    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout success!",
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };
    //login
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body),
        }).send(res);
    };
    //signUp
    signUp = async (req, res, next) => {
        // return res.status(201).json(await AccessService.signUp(req.body));
        new CREATED({
            message: "Registered OK!",
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            },
        }).send(res);
    };
}

module.exports = new AccessController();
