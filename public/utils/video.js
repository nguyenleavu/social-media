"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cropVideoWithProgress = exports.encodeHLSWithMultipleVideoStreams = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const MAXIMUM_BITRATE_720P = 5 * 10 ** 6; // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6; // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6; // 16Mbps
const runCommandWithImmediateOutput = (command, arg) => {
    return new Promise((resolve, reject) => {
        const childProcess = (0, child_process_1.spawn)(command, arg);
        childProcess.stdout.on('data', (data) => {
            resolve(String(data).trim());
        });
        childProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error('Command failed'));
            }
        });
    });
};
const runCommandWithProgress = (command, arg) => {
    return new Promise((resolve, reject) => {
        const childProcess = (0, child_process_1.spawn)(command, arg);
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            }
            else {
                reject(new Error('Command failed'));
            }
        });
    });
};
const getBitrate = async (filePath) => {
    const value = await runCommandWithImmediateOutput('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=bit_rate',
        '-of',
        'default=nw=1:nk=1',
        filePath
    ]);
    return Number(value);
};
const getResolution = async (filePath) => {
    const value = await runCommandWithImmediateOutput('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'csv=s=x:p=0',
        filePath
    ]);
    const resolution = value.split('x');
    const [width, height] = resolution;
    return {
        width: Number(width),
        height: Number(height)
    };
};
const getWidth = (height, resolution) => {
    const width = Math.round((height * resolution.width) / resolution.height);
    // Vì ffmpeg yêu cầu width và height phải là số chẵn
    return width % 2 === 0 ? width : width + 1;
};
const encodeHLSWithMultipleVideoStreams = async (inputPath) => {
    const [bitrate, resolution] = await Promise.all([getBitrate(inputPath), getResolution(inputPath)]);
    const parent_folder = path_1.default.join(inputPath, '..');
    const outputSegmentPath = path_1.default.join(parent_folder, 'v%v/fileSequence%d.ts');
    const outputPath = path_1.default.join(parent_folder, 'v%v/prog_index.m3u8');
    const bitrate720 = bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate;
    const bitrate1080 = bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate;
    const bitrate1440 = bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate;
    const argsWithMax720 = [
        '-y',
        '-i',
        inputPath,
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-s:v:0',
        `${getWidth(720, resolution)}x720`,
        '-c:v:0',
        'libx264',
        '-b:v:0',
        bitrate720,
        '-c:a',
        'copy',
        '-var_stream_map',
        'v:0,a:0',
        '-master_pl_name',
        'master.m3u8',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        outputSegmentPath,
        outputPath
    ];
    const argsWithMax1080 = [
        '-y',
        '-i',
        inputPath,
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-s:v:0',
        `${getWidth(720, resolution)}x720`,
        '-c:v:0',
        'libx264',
        '-b:v:0',
        bitrate720,
        '-s:v:1',
        `${getWidth(1080, resolution)}x1080`,
        '-c:v:1',
        'libx264',
        '-b:v:1',
        bitrate1080,
        '-c:a',
        'copy',
        '-var_stream_map',
        'v:0,a:0 v:1,a:1',
        '-master_pl_name',
        'master.m3u8',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        outputSegmentPath,
        outputPath
    ];
    const argsWithMax1440 = [
        '-y',
        '-i',
        inputPath,
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-s:v:0',
        `${getWidth(720, resolution)}x720`,
        '-c:v:0',
        'libx264',
        '-b:v:0',
        bitrate720,
        '-s:v:1',
        `${getWidth(1080, resolution)}x1080`,
        '-c:v:1',
        'libx264',
        '-b:v:1',
        bitrate1080,
        '-s:v:2',
        `${getWidth(1440, resolution)}x1440`,
        '-c:v:2',
        'libx264',
        '-b:v:2',
        bitrate1440,
        '-c:a',
        'copy',
        '-var_stream_map',
        'v:0,a:0 v:1,a:1 v:2,a:2',
        '-master_pl_name',
        'master.m3u8',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        outputSegmentPath,
        outputPath
    ];
    const argsWithOriginalWidth = [
        '-y',
        '-i',
        inputPath,
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-map',
        '0:0',
        '-map',
        '0:1',
        '-s:v:0',
        `${getWidth(720, resolution)}x720`,
        '-c:v:0',
        'libx264',
        '-b:v:0',
        bitrate720,
        '-s:v:1',
        `${getWidth(1080, resolution)}x1080`,
        '-c:v:1',
        'libx264',
        '-b:v:1',
        bitrate1080,
        '-c:v:2',
        'libx264',
        '-b:v:2',
        bitrate,
        '-c:a',
        'copy',
        '-var_stream_map',
        'v:0,a:0 v:1,a:1 v:2,a:2',
        '-master_pl_name',
        'master.m3u8',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_list_size',
        '0',
        '-hls_segment_filename',
        outputSegmentPath,
        outputPath
    ];
    let args = argsWithMax720;
    if (resolution.height > 720) {
        args = argsWithMax1080;
    }
    if (resolution.height > 1080) {
        args = argsWithMax1440;
    }
    if (resolution.height > 1440) {
        args = argsWithOriginalWidth;
    }
    await runCommandWithProgress('ffmpeg', args);
    console.log('Convert thành công');
};
exports.encodeHLSWithMultipleVideoStreams = encodeHLSWithMultipleVideoStreams;
const cropVideoWithProgress = async (inputPath, width, height, x, y) => {
    const parent_folder = path_1.default.join(inputPath, '..');
    const outputPath = path_1.default.join(parent_folder, 'output.mp4');
    await runCommandWithProgress('ffmpeg', [
        '-y',
        '-i',
        inputPath,
        '-filter:v',
        `crop=${width}:${height}:${x}:${y}`,
        '-threads',
        '5',
        '-preset',
        'ultrafast',
        '-strict',
        '-2',
        outputPath
    ]);
};
exports.cropVideoWithProgress = cropVideoWithProgress;
