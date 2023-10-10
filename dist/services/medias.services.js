"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../constants/config");
const dir_1 = require("../constants/dir");
const enums_1 = require("../constants/enums");
const VideoStatus_schema_1 = __importDefault(require("../models/schemas/VideoStatus.schema"));
const file_1 = require("../utils/file");
const s3_1 = require("../utils/s3");
const video_1 = require("../utils/video");
const dotenv_1 = require("dotenv");
const promises_1 = __importDefault(require("fs/promises"));
const lodash_1 = require("lodash");
const mime_1 = __importDefault(require("mime"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const database_services_1 = __importDefault(require("./database.services"));
const rimraf_1 = require("rimraf");
(0, dotenv_1.config)();
class Queue {
    items;
    encoding;
    constructor() {
        this.items = [];
        this.encoding = false;
    }
    async enqueue(item) {
        this.items.push(item);
        const idName = (0, file_1.getNameFromFullName)(item.split(`\\`).pop());
        await database_services_1.default.videoStatus.insertOne(new VideoStatus_schema_1.default({
            name: idName,
            status: enums_1.EncodingStatus.Pending
        }));
        this.processEncode();
    }
    async processEncode() {
        if (this.encoding)
            return;
        if (this.items.length > 0) {
            this.encoding = true;
            const videoPath = this.items[0];
            const idName = (0, file_1.getNameFromFullName)(videoPath.split('\\').pop());
            await database_services_1.default.videoStatus.updateOne({ name: idName }, {
                $set: {
                    status: enums_1.EncodingStatus.Processing
                },
                $currentDate: {
                    updated_at: true
                }
            });
            try {
                (0, video_1.encodeHLSWithMultipleVideoStreams)(videoPath);
                this.items.shift();
                const files = (0, file_1.getFiles)(path_1.default.resolve(dir_1.UPLOAD_VIDEO_DIR, idName));
                Promise.all((0, lodash_1.map)(files, (filepath) => {
                    const fileName = 'video-hls/' + filepath.replace(path_1.default.resolve(dir_1.UPLOAD_VIDEO_DIR), '').replace('\\', '');
                    return (0, s3_1.uploadFileToS3)({
                        filePath: filepath,
                        fileName,
                        contentType: mime_1.default.getType(filepath)
                    });
                }));
                (0, rimraf_1.rimrafSync)(path_1.default.resolve(dir_1.UPLOAD_VIDEO_DIR, idName));
                await database_services_1.default.videoStatus.updateOne({ name: idName }, {
                    $set: {
                        status: enums_1.EncodingStatus.Success
                    },
                    $currentDate: {
                        created_at: true,
                        updated_at: true
                    }
                });
            }
            catch (error) {
                await database_services_1.default.videoStatus
                    .updateOne({ name: idName }, {
                    $set: {
                        status: enums_1.EncodingStatus.Failed
                    },
                    $currentDate: {
                        created_at: true,
                        updated_at: true
                    }
                })
                    .catch((err) => {
                    console.log('Update video status error', err);
                });
            }
            this.encoding = false;
            this.processEncode();
        }
        else {
            console.log(`Encode video queue is empty`);
        }
    }
}
const queue = new Queue();
class MediasService {
    async uploadImage(req) {
        const files = await (0, file_1.handleUploadImage)(req);
        const data = await Promise.all((0, lodash_1.map)(files, async (file) => {
            const newName = (0, file_1.getNameFromFullName)(file.newFilename);
            const fileName = `${newName}.jpg`;
            const newPath = path_1.default.resolve(dir_1.UPLOAD_IMAGE_DIR, fileName);
            await (0, sharp_1.default)(file.filepath).jpeg().toFile(newPath);
            const result = await (0, s3_1.uploadFileToS3)({
                fileName: 'images/' + fileName,
                filePath: newPath,
                contentType: mime_1.default.getType(newPath)
            });
            await Promise.all([promises_1.default.unlink(file.filepath), promises_1.default.unlink(newPath)]);
            return {
                url: result.Location,
                type: enums_1.MediaType.Image
            };
        }));
        return data;
    }
    async uploadVideo(req) {
        const files = await (0, file_1.handleUploadVideo)(req);
        const data = await Promise.all(files.map(async (file) => {
            const result = await (0, s3_1.uploadFileToS3)({
                fileName: 'videos/' + file.newFilename,
                contentType: mime_1.default.getType(file.filepath),
                filePath: file.filepath
            });
            promises_1.default.unlink(file.filepath);
            return {
                url: result.Location,
                type: enums_1.MediaType.Video
            };
        }));
        return data;
    }
    async uploadVideoHLS(req) {
        const files = await (0, file_1.handleUploadVideoHLS)(req);
        const data = await Promise.all(files.map(async (file) => {
            const newFilename = (0, file_1.getNameFromFullName)(file.newFilename);
            queue.enqueue(file.filepath);
            return {
                url: config_1.isProduction
                    ? `${process.env.HOST}/static/video-hls/${newFilename}/master.m3u8`
                    : `http://localhost:${process.env.PORT}/static/video-hls/${newFilename}/master.m3u8`,
                type: enums_1.MediaType.HLS
            };
        }));
        return data;
    }
    async getVideoStatus(id) {
        const data = await database_services_1.default.videoStatus.findOne({ name: id });
        return data;
    }
}
const mediasService = new MediasService();
exports.default = mediasService;
