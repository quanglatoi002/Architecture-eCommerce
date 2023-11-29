"use strict";

const { BadRequestError } = require("../core/error.response");
const { SuccessResponse } = require("../core/success.response");
const updateImageFromLocalS3 = require("../services/upload.service");

class UploadController {
    uploadImageFromLocalS3 = async (req, res, next) => {
        const { file } = req;
        // console.log(req.file);
        console.log(file);
        if (!file) {
            throw new BadRequestError("File missing");
        }
        new SuccessResponse({
            message: "upload successfully uploaded use S3Client",
            metadata: await updateImageFromLocalS3({ file }),
        }).send(res);
    };
}

module.exports = new UploadController();
