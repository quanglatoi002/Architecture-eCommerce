"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");
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

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };
    static findByUserId = async (userId) => {
        return await keytokenModel
            .findOne({
                user: new Types.ObjectId(userId),
            })
            .lean();
    };
    static remoteKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: new Types.ObjectId(id) });
    };

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel
            .findOne({
                refreshTokensUsed: refreshToken,
            })
            .lean();
    };

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken });
    };

    static deleteKeyById = async (userId) => {
        return await keytokenModel.findByIdAndDelete({
            user: new Types.ObjectId(userId),
        });
    };
}

module.exports = KeyTokenService;
