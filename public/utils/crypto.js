"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPassword = void 0;
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const sha256 = (content) => {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
};
const hasPassword = (password) => {
    return sha256(password + process.env.PASSWORD_SECRET);
};
exports.hasPassword = hasPassword;
