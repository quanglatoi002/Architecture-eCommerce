"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        privateKey,
        publicKey,
        refreshToken,
    }) => {
        try {
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     privateKey,
            //     publicKey,
            // });
            // return tokens ? tokens.publicKey : null;
            const filter = {
                    user: userId,
                },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokenUsed: [],
                    refreshToken,
                },
                //upsert nếu ch sẽ tạo mới còn có rồi sẽ update
                options = { upsert: true, new: true };
            const tokens = await keytokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );

            return token ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };
}

module.exports = KeyTokenService;
