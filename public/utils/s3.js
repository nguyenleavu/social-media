"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFileToS3 = exports.uploadFileToS3 = void 0;
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
(0, dotenv_1.config)();
const s3 = new client_s3_1.S3({
    region: process.env.NODE_AWS_REGION,
    credentials: {
        secretAccessKey: process.env.NODE_AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.NODE_AWS_ACCESS_KEY_ID
    }
});
const uploadFileToS3 = ({ fileName, filePath, contentType }) => {
    const parallelUploads3 = new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: fs_1.default.readFileSync(filePath),
            ContentType: contentType
        },
        tags: [
        /*...*/
        ], // optional tags
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false // optional manually handle dropped parts
    });
    return parallelUploads3.done();
};
exports.uploadFileToS3 = uploadFileToS3;
const sendFileToS3 = async (res, filepath) => {
    try {
        const data = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filepath
        });
        data.Body.pipe(res);
    }
    catch (error) {
        res.status(httpStatus_1.default.NOT_FOUND).send('Not found');
    }
};
exports.sendFileToS3 = sendFileToS3;
