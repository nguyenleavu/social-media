"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cropVideoWithProgress = exports.encodeHLSWithMultipleVideoStreams = exports.checkVideoHasAudio = void 0;
const path_1 = __importDefault(require("path"));
const MAXIMUM_BITRATE_720P = 5 * 10 ** 6;
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6;
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6;
const checkVideoHasAudio = async (filePath) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const { stdout } = await $ `ffprobe ${[
        '-v',
        'error',
        '-select_streams',
        'a:0',
        '-show_entries',
        'stream=codec_type',
        '-of',
        'default=nw=1:nk=1',
        slash(filePath)
    ]}`;
    return stdout.trim() === 'audio';
};
exports.checkVideoHasAudio = checkVideoHasAudio;
const getBitrate = async (filePath) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const { stdout } = await $ `ffprobe ${[
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=bit_rate',
        '-of',
        'default=nw=1:nk=1',
        slash(filePath)
    ]}`;
    return Number(stdout.trim());
};
const getResolution = async (filePath) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const { stdout } = await $ `ffprobe ${[
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'csv=s=x:p=0',
        slash(filePath)
    ]}`;
    const resolution = stdout.trim().split('x');
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
const encodeMax720 = async ({ bitrate, inputPath, isHasAudio, outputPath, outputSegmentPath, resolution }) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const args = [
        '-y',
        '-i',
        slash(inputPath),
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        '-map',
        '0:0'
    ];
    if (isHasAudio) {
        args.push('-map', '0:1');
    }
    args.push('-s:v:0', `${getWidth(720, resolution)}x720`, '-c:v:0', 'libx264', '-b:v:0', `${bitrate[720]}`, '-c:a', 'copy', '-var_stream_map');
    if (isHasAudio) {
        args.push('v:0,a:0');
    }
    else {
        args.push('v:0');
    }
    args.push('-master_pl_name', 'master.m3u8', '-f', 'hls', '-hls_time', '6', '-hls_list_size', '0', '-hls_segment_filename', slash(outputSegmentPath), slash(outputPath));
    await $ `ffmpeg ${args}`;
    return true;
};
const encodeMax1080 = async ({ bitrate, inputPath, isHasAudio, outputPath, outputSegmentPath, resolution }) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '17', '-sc_threshold', '0'];
    if (isHasAudio) {
        args.push('-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1');
    }
    else {
        args.push('-map', '0:0', '-map', '0:0');
    }
    args.push('-s:v:0', `${getWidth(720, resolution)}x720`, '-c:v:0', 'libx264', '-b:v:0', `${bitrate[720]}`, '-s:v:1', `${getWidth(1080, resolution)}x1080`, '-c:v:1', 'libx264', '-b:v:1', `${bitrate[1080]}`, '-c:a', 'copy', '-var_stream_map');
    if (isHasAudio) {
        args.push('v:0,a:0 v:1,a:1');
    }
    else {
        args.push('v:0 v:1');
    }
    args.push('-master_pl_name', 'master.m3u8', '-f', 'hls', '-hls_time', '6', '-hls_list_size', '0', '-hls_segment_filename', slash(outputSegmentPath), slash(outputPath));
    await $ `ffmpeg ${args}`;
    return true;
};
const encodeMax1440 = async ({ bitrate, inputPath, isHasAudio, outputPath, outputSegmentPath, resolution }) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '17', '-sc_threshold', '0'];
    if (isHasAudio) {
        args.push('-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1');
    }
    else {
        args.push('-map', '0:0', '-map', '0:0', '-map', '0:0');
    }
    args.push('-s:v:0', `${getWidth(720, resolution)}x720`, '-c:v:0', 'libx264', '-b:v:0', `${bitrate[720]}`, '-s:v:1', `${getWidth(1080, resolution)}x1080`, '-c:v:1', 'libx264', '-b:v:1', `${bitrate[1080]}`, '-s:v:2', `${getWidth(1440, resolution)}x1440`, '-c:v:2', 'libx264', '-b:v:2', `${bitrate[1440]}`, '-c:a', 'copy', '-var_stream_map');
    if (isHasAudio) {
        args.push('v:0,a:0 v:1,a:1 v:2,a:2');
    }
    else {
        args.push('v:0 v:1 v2');
    }
    args.push('-master_pl_name', 'master.m3u8', '-f', 'hls', '-hls_time', '6', '-hls_list_size', '0', '-hls_segment_filename', slash(outputSegmentPath), slash(outputPath));
    await $ `ffmpeg ${args}`;
    return true;
};
const encodeMaxOriginal = async ({ bitrate, inputPath, isHasAudio, outputPath, outputSegmentPath, resolution }) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '17', '-sc_threshold', '0'];
    if (isHasAudio) {
        args.push('-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1', '-map', '0:0', '-map', '0:1');
    }
    else {
        args.push('-map', '0:0', '-map', '0:0', '-map', '0:0');
    }
    args.push('-s:v:0', `${getWidth(720, resolution)}x720`, '-c:v:0', 'libx264', '-b:v:0', `${bitrate[720]}`, '-s:v:1', `${getWidth(1080, resolution)}x1080`, '-c:v:1', 'libx264', '-b:v:1', `${bitrate[1080]}`, '-s:v:2', `${resolution.width}x${resolution.height}`, '-c:v:2', 'libx264', '-b:v:2', `${bitrate.original}`, '-c:a', 'copy', '-var_stream_map');
    if (isHasAudio) {
        args.push('v:0,a:0 v:1,a:1 v:2,a:2');
    }
    else {
        args.push('v:0 v:1 v2');
    }
    args.push('-master_pl_name', 'master.m3u8', '-f', 'hls', '-hls_time', '6', '-hls_list_size', '0', '-hls_segment_filename', slash(outputSegmentPath), slash(outputPath));
    await $ `ffmpeg ${args}`;
    return true;
};
const encodeHLSWithMultipleVideoStreams = async (inputPath) => {
    const [bitrate, resolution] = await Promise.all([getBitrate(inputPath), getResolution(inputPath)]);
    const parent_folder = path_1.default.join(inputPath, '..');
    const outputSegmentPath = path_1.default.join(parent_folder, 'v%v/fileSequence%d.ts');
    const outputPath = path_1.default.join(parent_folder, 'v%v/prog_index.m3u8');
    const bitrate720 = bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate;
    const bitrate1080 = bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate;
    const bitrate1440 = bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate;
    const isHasAudio = await (0, exports.checkVideoHasAudio)(inputPath);
    let encodeFunc = encodeMax720;
    if (resolution.height > 720) {
        encodeFunc = encodeMax1080;
    }
    if (resolution.height > 1080) {
        encodeFunc = encodeMax1440;
    }
    if (resolution.height > 1440) {
        encodeFunc = encodeMaxOriginal;
    }
    await encodeFunc({
        bitrate: {
            720: bitrate720,
            1080: bitrate1080,
            1440: bitrate1440,
            original: bitrate
        },
        inputPath,
        isHasAudio,
        outputPath,
        outputSegmentPath,
        resolution
    });
    return true;
};
exports.encodeHLSWithMultipleVideoStreams = encodeHLSWithMultipleVideoStreams;
const cropVideoWithProgress = async (inputPath, width, height, x, y) => {
    const { $ } = await import('zx');
    const slash = (await import('slash')).default;
    const parent_folder = path_1.default.join(inputPath, '..');
    const outputPath = path_1.default.join(parent_folder, 'output.mp4');
    const args = [
        '-y',
        '-i',
        slash(inputPath),
        '-filter:v',
        `crop=${width}:${height}:${x}:${y}`,
        '-threads',
        '5',
        '-preset',
        'ultrafast',
        '-strict',
        '-2',
        slash(outputPath)
    ];
    await $ `ffmpeg ${args}`;
};
exports.cropVideoWithProgress = cropVideoWithProgress;
