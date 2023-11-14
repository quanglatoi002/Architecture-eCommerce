"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({ userId, privateKey, publicKey }) => {
        try {
            const tokens = await keytokenModel.create({
                user: userId,
                privateKey,
                publicKey,
            });
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };
}

module.exports = KeyTokenService;
