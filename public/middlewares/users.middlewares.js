"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.croppedAreaValidator = exports.getConversationValidator = exports.isUserLoggedInValidator = exports.changePasswordValidator = exports.unFollowValidator = exports.followValidator = exports.updateMeValidator = exports.verifiedUserValidator = exports.resetPasswordValidator = exports.verifyForgotPasswordValidator = exports.forgotPasswordValidator = exports.emailVerifyTokenValidator = exports.refreshTokenValidator = exports.accessTokenValidator = exports.registerValidator = exports.loginValidator = void 0;
const enums_1 = require("../constants/enums");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const regex_1 = require("../constants/regex");
const Errors_1 = require("../models/Errors");
const database_services_1 = __importDefault(require("../services/database.services"));
const users_services_1 = __importDefault(require("../services/users.services"));
const crypto_1 = require("../utils/crypto");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
exports.loginValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const user = await database_services_1.default.users.findOne({
                    email: value,
                    password: (0, crypto_1.hasPassword)(req.body.password)
                });
                if ((0, lodash_1.isEmpty)(user)) {
                    throw new Error(messages_1.USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT);
                }
                req.user = user;
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_255
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    }
}, ['body']));
exports.registerValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.NAME_MUST_BE_FROM_6_TO_255
        },
        trim: true
    },
    email: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
            options: async (value) => {
                const isEmailExists = await users_services_1.default.checkEmailExist(value);
                if (isEmailExists) {
                    throw new Error(messages_1.USER_MESSAGES.EMAIL_ALREADY_EXISTS);
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_255
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    },
    confirm_password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_255
        },
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(messages_1.USER_MESSAGES.CONFIRM_PASSWORD_DOES_NOT_MATCH);
                }
                return true;
            }
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: messages_1.USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO_DATE
        }
    }
}, ['body']));
exports.accessTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    Authorization: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const accessToken = value.split(' ')[1];
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
                    req.decode_authorization = decode_authorization;
                }
                catch (error) {
                    throw new Errors_1.ErrorWithStatus({
                        message: (0, lodash_1.capitalize)(error.message),
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                return true;
            }
        }
    }
}, ['headers']));
exports.refreshTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    refresh_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.REFRESH_ACCESS_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                try {
                    const [decode_refresh_token, refresh_token] = await Promise.all([
                        (0, jwt_1.verifyToken)({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN }),
                        database_services_1.default.refreshTokens.findOne({ token: value })
                    ]);
                    if ((0, lodash_1.isEmpty)(refresh_token)) {
                        throw new Errors_1.ErrorWithStatus({
                            message: messages_1.USER_MESSAGES.REFRESH_TOKEN_DOES_NOT_EXISTS,
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    req.decode_refresh_token = decode_refresh_token;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new Errors_1.ErrorWithStatus({
                            message: (0, lodash_1.capitalize)(error.message),
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    throw error;
                }
                return true;
            }
        }
    }
}, ['body']));
exports.emailVerifyTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email_verify_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                try {
                    const decode_email_verify_token = await (0, jwt_1.verifyToken)({
                        token: value,
                        secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN
                    });
                    req.decode_email_verify_token = decode_email_verify_token;
                }
                catch (error) {
                    throw new Errors_1.ErrorWithStatus({
                        message: (0, lodash_1.capitalize)(error.message),
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                return true;
            }
        }
    }
}, ['body']));
exports.forgotPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: messages_1.USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const user = await database_services_1.default.users.findOne({ email: value });
                if ((0, lodash_1.isEmpty)(user)) {
                    throw new Error(messages_1.USER_MESSAGES.USER_NOT_FOUND);
                }
                req.user = user;
                return true;
            }
        }
    }
}, ['body']));
exports.verifyForgotPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    forgot_password_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                try {
                    const decode_forgot_password_token = await (0, jwt_1.verifyToken)({
                        token: value,
                        secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN
                    });
                    const { user_id } = decode_forgot_password_token;
                    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
                    if ((0, lodash_1.isEmpty)(user)) {
                        throw new Errors_1.ErrorWithStatus({
                            message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    if (user.forgot_password_token !== value) {
                        throw new Errors_1.ErrorWithStatus({
                            message: messages_1.USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new Errors_1.ErrorWithStatus({
                            message: (0, lodash_1.capitalize)(error.message),
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    throw error;
                }
                return true;
            }
        }
    }
}, ['body']));
exports.resetPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_255
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    },
    confirm_password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_255
        },
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(messages_1.USER_MESSAGES.CONFIRM_PASSWORD_DOES_NOT_MATCH);
                }
                return true;
            }
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    },
    forgot_password_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
                try {
                    const decode_forgot_password_token = await (0, jwt_1.verifyToken)({
                        token: value,
                        secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN
                    });
                    const { user_id } = decode_forgot_password_token;
                    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
                    if ((0, lodash_1.isEmpty)(user)) {
                        throw new Errors_1.ErrorWithStatus({
                            message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    if (user.forgot_password_token !== value) {
                        throw new Errors_1.ErrorWithStatus({
                            message: messages_1.USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    req.decode_forgot_password_token = decode_forgot_password_token;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new Errors_1.ErrorWithStatus({
                            message: (0, lodash_1.capitalize)(error.message),
                            status: httpStatus_1.default.UNAUTHORIZE
                        });
                    }
                    throw error;
                }
                return true;
            }
        }
    }
}));
const verifiedUserValidator = (req, res, next) => {
    const { verify } = req.decode_authorization;
    if (verify !== enums_1.UserVerifyStatus.Verified) {
        return next(new Errors_1.ErrorWithStatus({
            message: messages_1.USER_MESSAGES.USER_NOT_VERIFIED,
            status: httpStatus_1.default.FORBIDDEN
        }));
    }
    next();
};
exports.verifiedUserValidator = verifiedUserValidator;
exports.updateMeValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.NAME_MUST_BE_FROM_6_TO_255
        },
        trim: true
    },
    date_of_birth: {
        optional: true,
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: messages_1.USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO_DATE
        }
    },
    bio: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.BIO_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 1,
                max: 2000
            },
            errorMessage: messages_1.USER_MESSAGES.BIO_MUST_BE_FROM_1_TO_2000
        },
        trim: true
    },
    location: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.LOCATION_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 1,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.LOCATION_MUST_BE_FROM_1_TO_255
        },
        trim: true
    },
    website: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.WEBSITE_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 1,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.WEBSITE_MUST_BE_FROM_1_TO_255
        },
        trim: true
    },
    username: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
            options: async (value) => {
                if (!regex_1.REGEX_USERNAME.test(value)) {
                    throw new Error(messages_1.USER_MESSAGES.USERNAME_IS_INVALID);
                }
                const user = await database_services_1.default.users.findOne({ username: value });
                if (user) {
                    throw new Error(messages_1.USER_MESSAGES.USERNAME_ALREADY_USED);
                }
            }
        }
    },
    avatar: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.AVATAR_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 1,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.AVATAR_MUST_BE_FROM_1_TO_255
        },
        trim: true
    },
    cover_photo: {
        optional: true,
        isString: {
            errorMessage: messages_1.USER_MESSAGES.COVER_PHOTO_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 1,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.COVER_PHOTO_MUST_BE_FROM_1_TO_255
        },
        trim: true
    }
}, ['body']));
exports.followValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    followed_user_id: {
        custom: {
            options: async (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.INVALID_USER_ID,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
                const followed_user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(value) });
                if ((0, lodash_1.isEmpty)(followed_user)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
            }
        }
    }
}, ['body']));
exports.unFollowValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    user_id: {
        custom: {
            options: async (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.INVALID_USER_ID,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
                const followed_user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(value) });
                if ((0, lodash_1.isEmpty)(followed_user)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
            }
        }
    }
}, ['params']));
exports.changePasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    old_password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_255
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
            options: async (value, { req }) => {
                const { user_id } = req.decode_authorization;
                const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
                if ((0, lodash_1.isEmpty)(user)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
                const { password } = user;
                const isMatch = (0, crypto_1.hasPassword)(value) === password;
                if (!isMatch) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                        status: httpStatus_1.default.UNAUTHORIZE
                    });
                }
            }
        },
        trim: true
    },
    new_password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.NEW_PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.NEW_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_255
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    },
    confirm_new_password: {
        notEmpty: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 255
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_255
        },
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.new_password) {
                    throw new Error(messages_1.USER_MESSAGES.CONFIRM_PASSWORD_DOES_NOT_MATCH);
                }
                return true;
            }
        },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minUppercase: 1,
                minSymbols: 1
            },
            errorMessage: messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        trim: true
    }
}, ['body']));
const isUserLoggedInValidator = (middleware) => (req, res, next) => {
    if (req.headers.authorization) {
        return middleware(req, res, next);
    }
    next();
};
exports.isUserLoggedInValidator = isUserLoggedInValidator;
exports.getConversationValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    receiver_id: {
        custom: {
            options: async (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.INVALID_USER_ID,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
                const receiver_user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(value) });
                if ((0, lodash_1.isEmpty)(receiver_user)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
            }
        }
    }
}, ['params']));
exports.croppedAreaValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    width: {
        isNumeric: true
    },
    height: {
        isNumeric: true
    },
    x: {
        isNumeric: true
    },
    y: {
        isNumeric: true
    }
}, ['query']));
