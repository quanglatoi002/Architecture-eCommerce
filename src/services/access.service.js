"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
    BadRequestError,
    ConflictRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError,
} = require("../core/error.response");

//service //
const { findByEmail } = require("./shop.service");
const { Types } = require("mongoose");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
    /*
        1. check refreshToken đã có trong refreshTokenUsed
        Co => xóa user ra khỏi keyStore
        ko có => tìm kiếm refreshToken
    */
    static handlerRefreshToken = async ({ user, keyStore, refreshToken }) => {
        // 1 find refresh token đã được sử dụng trước đó ch?
        const { email, userId } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(
                "Something went wrong happened !! Pls relogin"
            );
        }

        if (keyStore.refreshToken !== refreshToken)
            throw new AuthFailureError("Shop not registered");

        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registered");

        //create lại token mới
        const tokens = await createTokenPair(
            {
                userId,
                email,
            },
            keyStore.publicKey,
            keyStore.privateKey
        );

        //update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // refreshToken đã đc sử dụng để tạo mới
            },
        });
        return {
            user,
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.remoteKeyById(keyStore._id);
        return delKey;
    };
    /*
        1 - check email in dbs
        2 - match password
        3 - create AT vs RT and save
        4 - generate tokens
        5 - get data return login
     */
    static login = async ({ email, password, refreshToken = null }) => {
        //1.
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Shop not registered");

        //2.
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication error");

        //3.
        //create privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");
        //4.generate tokens
        const { _id: userId } = foundShop;
        // tạo accessToken với userId, email cần được mã hóa và chuỗi để mã hóa là privateKey
        const tokens = await createTokenPair(
            {
                userId,
                email,
            },
            publicKey,
            privateKey
        );

        await KeyTokenService.createKeyToken({
            privateKey,
            publicKey,
            refreshToken: tokens.refreshToken,
            userId,
        });
        //5.
        return {
            //chỉ lấy _id, name, email từ newShop
            metadata: {
                shop: getInfoData({
                    fileds: ["_id", "name", "email"],
                    object: foundShop,
                }),
                tokens,
            },
        };
    };

    static signUp = async ({ name, email, password }) => {
        // try {
        //step 1: check email exist?
        //lean() trả về 1 object js thuần
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError("Error: Shop already registered!");
        }
        //hash password
        const passwordHash = await bcrypt.hash(password, 10);
        // create shop
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });
        //when create success
        if (newShop) {
            //create privateKey, publicKey
            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");
            console.log(publicKey);

            // share publicKey with user will have publicKey
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) throw new NotFoundError("Not Found keyStore");
            //create token pair
            const tokens = await createTokenPair(
                {
                    userId: newShop._id,
                    email,
                },
                publicKey,
                privateKey
            );
            console.log(`Create Token Success:`, tokens);
            return {
                code: 201,
                //chỉ lấy _id, name, email từ newShop
                metadata: {
                    shop: getInfoData({
                        fileds: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }
        return {
            code: 200,
            metadata: null,
        };
        // } catch (error) {
        //     console.log(error);
        //     return {
        //         code: "xxx",
        //         message: error.message,
        //         status: "error",
        //     };
        // }
    };
}

module.exports = AccessService;
