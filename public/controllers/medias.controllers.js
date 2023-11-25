"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoStatusController = exports.serverSegmentController = exports.serverM3U8controller = exports.serverVideoStreamController = exports.serverImageController = exports.uploadVideoHLSController = exports.uploadVideoController = exports.uploadImageController = void 0;
const dir_1 = require("../constants/dir");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const medias_services_1 = __importDefault(require("../services/medias.services"));
const s3_1 = require("../utils/s3");
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const mime_1 = __importDefault(require("mime"));
const path_1 = __importDefault(require("path"));
const uploadImageController = async (req, res) => {
    const data = await medias_services_1.default.uploadImage(req);
    return res.json({ message: messages_1.USER_MESSAGES.UPLOAD_IMAGE_SUCCESS, data });
};
exports.uploadImageController = uploadImageController;
const uploadVideoController = async (req, res) => {
    const data = await medias_services_1.default.uploadVideo(req);
    return res.json({ message: messages_1.USER_MESSAGES.UPLOAD_VIDEO_SUCCESS, data });
};
exports.uploadVideoController = uploadVideoController;
const uploadVideoHLSController = async (req, res) => {
    const data = await medias_services_1.default.uploadVideoHLS(req);
    return res.json({ message: messages_1.USER_MESSAGES.UPLOAD_VIDEO_SUCCESS, data });
};
exports.uploadVideoHLSController = uploadVideoHLSController;
const serverImageController = (req, res) => {
    const { name } = req.params;
    return res.sendFile(path_1.default.resolve(dir_1.UPLOAD_IMAGE_DIR, name), (err) => {
        if (err) {
            res.status(err.status).send('Not found');
        }
    });
};
exports.serverImageController = serverImageController;
const serverVideoStreamController = (req, res) => {
    const range = req.headers.range;
    if ((0, lodash_1.isEmpty)(range)) {
        return res.status(httpStatus_1.default.BAD_REQUEST).send('Requires range header');
    }
    const { name } = req.params;
    const videoPath = path_1.default.resolve(dir_1.UPLOAD_VIDEO_DIR, name);
    // Tính theo hệ thập phân :  1MB = 10^6 bytes
    // Tính theo hệ nhị phân :  1MB = 2^20 bytes
    // Dung lượng video
    const videoSize = fs_1.default.statSync(videoPath).size;
    // Dung lượng video cho mội phân đoạn stream
    const chunkSize = 10 ** 6; //1MB
    // Lấy giá trị byte bắt đầu từ header Range
    const start = Number(range.replace(/\D/g, ''));
    // Lấy giá trị byte kết thúc
    const end = Math.min(start + chunkSize, videoSize - 1);
    // Dung lượng thực tế cho mỗi đoạn video stream
    // Thường đây sẽ là chunkSize , ngoại trừ đoạn cuối cùng
    const contentLength = end - start + 1;
    const contentType = mime_1.default.getType(videoPath) || 'video/*';
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType
    };
    res.writeHead(httpStatus_1.default.PARTIAL_CONTENT, headers);
    fs_1.default.createReadStream(videoPath, { start, end }).pipe(res);
};
exports.serverVideoStreamController = serverVideoStreamController;
const serverM3U8controller = (req, res) => {
    const { id } = req.params;
    (0, s3_1.sendFileToS3)(res, `video-hls/${id}/master.m3u8`);
};
exports.serverM3U8controller = serverM3U8controller;
const serverSegmentController = (req, res) => {
    const { id, v, segment } = req.params;
    (0, s3_1.sendFileToS3)(res, `video-hls/${id}/${v}/${segment}`);
};
exports.serverSegmentController = serverSegmentController;
const videoStatusController = async (req, res) => {
    const { id } = req.params;
    const data = await medias_services_1.default.getVideoStatus(id);
    return res.json({ message: messages_1.USER_MESSAGES.GET_VIDEO_STATUS_SUCCESS, data });
};
exports.videoStatusController = videoStatusController;
