"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
    BadRequestError,
    ConflictRequestError,
    AuthFailureError,
} = require("../core/error.response");

//service //
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};
class AccessService {
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

            if (!keyStore) {
                return {};
            }
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
