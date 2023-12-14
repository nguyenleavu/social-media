"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashtagValidator = void 0;
const validation_1 = require("../utils/validation");
const express_validator_1 = require("express-validator");
exports.hashtagValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    content: {
        isString: {
            errorMessage: 'Content must be string'
        }
    }
}, ['query']));
