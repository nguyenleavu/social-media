"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = exports.handleUploadVideoHLS = exports.getExtension = exports.getNameFromFullName = exports.handleUploadVideo = exports.handleUploadImage = exports.initFolder = void 0;
const dir_1 = require("../constants/dir");
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const initFolder = () => {
    ;
    [dir_1.UPLOAD_IMAGE_TEMP_DIR, dir_1.UPLOAD_VIDEO_DIR].forEach((dir) => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, {
                recursive: true
            });
        }
    });
};
exports.initFolder = initFolder;
const handleUploadImage = (req) => {
    const form = (0, formidable_1.default)({
        uploadDir: dir_1.UPLOAD_IMAGE_TEMP_DIR,
        maxFiles: 10,
        maxFileSize: 200 * 1024 * 1024,
        keepExtensions: true,
        filter: ({ name, originalFilename, mimetype }) => {
            const isValid = name === 'image' && Boolean(mimetype?.includes('image/'));
            if (!isValid) {
                form.emit('error', new Error('File type is not valid'));
            }
            return isValid;
        }
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            if ((0, lodash_1.isEmpty)(files)) {
                return reject(new Error('File is empty'));
            }
            resolve(files.image);
        });
    });
};
exports.handleUploadImage = handleUploadImage;
const handleUploadVideo = (req) => {
    const form = (0, formidable_1.default)({
        uploadDir: dir_1.UPLOAD_VIDEO_DIR,
        maxFiles: 1,
        maxFileSize: 200 * 1024 * 1024,
        filter: ({ name, originalFilename, mimetype }) => {
            const isValid = name === 'video' && Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'));
            if (!isValid) {
                form.emit('error', new Error('File type is not valid'));
            }
            return isValid;
        }
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            if ((0, lodash_1.isEmpty)(files)) {
                return reject(new Error('File is empty'));
            }
            const videos = files.video;
            videos.forEach((video) => {
                const ext = (0, exports.getExtension)(video.originalFilename);
                fs_1.default.renameSync(video.filepath, `${video.filepath}.${ext}`);
                video.newFilename = `${video.newFilename}.${ext}`;
                video.filepath = `${video.filepath}.${ext}`;
            });
            resolve(files.video);
        });
    });
};
exports.handleUploadVideo = handleUploadVideo;
const getNameFromFullName = (fullName) => {
    const name = fullName.split('.');
    name.pop();
    return name.join('');
};
exports.getNameFromFullName = getNameFromFullName;
const getExtension = (fullName) => {
    const name = fullName.split('.');
    return name[name.length - 1];
};
exports.getExtension = getExtension;
// Cách xử lý chuẩn khi upload video và encode
// có 2 giai đoạn
// Upload video: Upload video thành công khi resolve về cho người dùng
// Encode video : Khai náo thêm 1 url endponit để check xem cái video đã encode xong chưa
const handleUploadVideoHLS = async (req) => {
    const nanoId = (await import('nanoid')).nanoid;
    const idName = nanoId();
    const folderPath = path_1.default.resolve(dir_1.UPLOAD_VIDEO_DIR, idName);
    fs_1.default.mkdirSync(folderPath);
    const form = (0, formidable_1.default)({
        uploadDir: folderPath,
        maxFiles: 1,
        maxFileSize: 200 * 1024 * 1024,
        filter: ({ name, originalFilename, mimetype }) => {
            const isValid = name === 'video' && Boolean(mimetype?.includes('video/') || mimetype?.includes('quicktime'));
            if (!isValid) {
                form.emit('error', new Error('File type is not valid'));
            }
            return isValid;
        },
        filename: () => idName
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            if ((0, lodash_1.isEmpty)(files)) {
                return reject(new Error('File is empty'));
            }
            const videos = files.video;
            videos.forEach((video) => {
                const ext = (0, exports.getExtension)(video.originalFilename);
                fs_1.default.renameSync(video.filepath, `${video.filepath}.${ext}`);
                video.newFilename = `${video.newFilename}.${ext}`;
                video.filepath = `${video.filepath}.${ext}`;
            });
            resolve(files.video);
        });
    });
};
exports.handleUploadVideoHLS = handleUploadVideoHLS;
const getFiles = (dir, files = []) => {
    // Get an array of all files and directories in the passed directory using fs.readdirSync
    const fileList = fs_1.default.readdirSync(dir);
    // Create the full path of the file/directory by concatenating the passed directory and file/directory name
    for (const file of fileList) {
        const name = `${dir}/${file}`;
        // Check if the current file/directory is a directory using fs.statSync
        if (fs_1.default.statSync(name).isDirectory()) {
            // If it is a directory, recursively call the getFiles function with the directory path and the files array
            (0, exports.getFiles)(name, files);
        }
        else {
            // If it is a file, push the full path to the files array
            files.push(name);
        }
    }
    return files;
};
exports.getFiles = getFiles;
