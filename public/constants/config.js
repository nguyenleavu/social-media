"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = void 0;
const minimist_1 = __importDefault(require("minimist"));
const options = (0, minimist_1.default)(process.argv.slice(2));
exports.isProduction = Boolean(options.production);
