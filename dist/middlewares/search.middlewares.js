"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchValidator = void 0;
const enums_1 = require("../constants/enums");
const validation_1 = require("../utils/validation");
const express_validator_1 = require("express-validator");
exports.searchValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    content: {
        isString: {
            errorMessage: 'Content must be string'
        }
    },
    media_type: {
        optional: true,
        isIn: {
            options: [Object.values(enums_1.MediaTypeQuery)]
        },
        errorMessage: `Media type must be  image or video`
    },
    people_follow: {
        optional: true,
        isIn: {
            options: [Object.values(enums_1.PeopleFollow)],
            errorMessage: `Media type must be  0 or 1`
        }
    }
}, ['query']));
