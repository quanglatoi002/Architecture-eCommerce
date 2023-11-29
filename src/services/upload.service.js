"use strict";

const {
    s3,
    PutObjectCommand,
    GetObjectCommand,
    DeleteBucketCommand,
} = require("../configs/s3.config");
const crypto = require("crypto");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
        //start public link image out community
        const singedUrl = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageName, //file.originalname
        });
        const url = await getSignedUrl(s3, singedUrl, { expiresIn: 3600 });

        return url;
        // return {
        //     images_url,
        //     shopId,
        //     thumb_url: aw,
        // };
    } catch (error) {
        console.error("Error uploading image use S3Client::", error);
    }
};

module.exports = updateImageFromLocalS3;
