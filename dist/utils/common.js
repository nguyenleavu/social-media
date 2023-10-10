"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.numberEnumToArray = void 0;
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const Errors_1 = require("../models/Errors");
const lodash_1 = require("lodash");
const jwt_1 = require("./jwt");
const numberEnumToArray = (numberEnum) => {
    return Object.values(numberEnum).filter((value) => typeof value === 'number');
};
exports.numberEnumToArray = numberEnumToArray;
const verifyAccessToken = async (accessToken, req) => {
    if ((0, lodash_1.isEmpty)(accessToken)) {
        throw new Errors_1.ErrorWithStatus({
            message: messages_1.USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
            status: httpStatus_1.default.UNAUTHORIZE
        });
    }
    try {
        const decode_authorization = await (0, jwt_1.verifyToken)({
            token: accessToken,
            secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN
        });
        if (req) {
            req.decode_authorization = decode_authorization;
            return true;
        }
        return decode_authorization;
    }
    catch (error) {
        throw new Errors_1.ErrorWithStatus({
            message: (0, lodash_1.capitalize)(error.message),
            status: httpStatus_1.default.UNAUTHORIZE
        });
    }
    return true;
};
exports.verifyAccessToken = verifyAccessToken;
