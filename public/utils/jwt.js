"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, dotenv_1.config)();
const signToken = ({ payload, privateKey, options = {
    algorithm: 'HS256'
} }) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, privateKey, options, (error, token) => {
            if (error) {
                throw reject(error);
            }
            resolve(token);
        });
    });
};
exports.signToken = signToken;
const verifyToken = ({ token, secretOrPublicKey }) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, secretOrPublicKey, (error, decode) => {
            if (error) {
                throw reject(error);
            }
            resolve(decode);
        });
    });
};
exports.verifyToken = verifyToken;
