"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = void 0;
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const Errors_1 = require("../models/Errors");
const lodash_1 = require("lodash");
const defaultErrorHandler = (error, req, res, next) => {
    try {
        if (error instanceof Errors_1.ErrorWithStatus) {
            return res.status(error.status).json((0, lodash_1.omit)(error, ['status']));
        }
        const finalError = {};
        Object.getOwnPropertyNames(error).forEach((key) => {
            if (!Object.getOwnPropertyDescriptor(error, key)?.configurable ||
                !Object.getOwnPropertyDescriptor(error, key)?.writable) {
                return;
            }
            finalError[key] = error[key];
            Object.defineProperty(error, key, { enumerable: true });
        });
        return res.status(httpStatus_1.default.INTERNAL_SERVER_ERROR).json({
            message: finalError.message,
            errorInfo: (0, lodash_1.omit)(finalError, ['stack'])
        });
    }
    catch (error) {
        return res.status(httpStatus_1.default.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
            errorInfo: (0, lodash_1.omit)(error, ['stack'])
        });
    }
};
exports.defaultErrorHandler = defaultErrorHandler;
