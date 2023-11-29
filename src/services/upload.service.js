"use strict";

const {
    s3,
    PutObjectCommand,
    GetObjectCommand,
    DeleteBucketCommand,
} = require("../configs/s3.config");
const crypto = require("crypto");
const urlImagePublic = process.env.AWS_CLOUD_FRONT;
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const randomImageName = () => crypto.randomBytes(16).toString("hex");

const updateImageFromLocalS3 = async ({ file }) => {
    try {
        // start update image up s3
        const imageName = randomImageName();
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageName,
            Body: file.buffer,
            ContentType: "image/jpeg",
        });

        //export url
        const result = await s3.send(command);

        //end update
        //start public S3 link image out community
        // const singedUrl = new GetObjectCommand({
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: imageName, //file.originalname
        // });
        //S3
        // const url = await getSignedUrl(s3, singedUrl, { expiresIn: 36000 });

        const url = getSignedUrl({
            url: `${urlImagePublic}/${imageName}`,
            keyPairId: process.env.AWS_PUBLIC_KEY_ID_CLOUD_FRONT,
            dateLessThan: new Date(Date.now() + 1000 * 60),
            privateKey: process.env.AWS_BUCKET_PUBLIC_KEY_ID,
        });

        return {
            url,
            result,
        };
    } catch (error) {
        console.error("Error uploading image use S3Client::", error);
    }
};

module.exports = updateImageFromLocalS3;
