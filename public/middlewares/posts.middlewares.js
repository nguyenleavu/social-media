"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediasTypeValidator = exports.paginationValidator = exports.getPostChildrenValidator = exports.audienceValidator = exports.postIdValidator = exports.createPostValidator = void 0;
const enums_1 = require("../constants/enums");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const Errors_1 = require("../models/Errors");
const database_services_1 = __importDefault(require("../services/database.services"));
const common_1 = require("../utils/common");
const handlers_1 = require("../utils/handlers");
const validation_1 = require("../utils/validation");
const express_validator_1 = require("express-validator");
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
const postType = (0, common_1.numberEnumToArray)(enums_1.PostType);
const postAudience = (0, common_1.numberEnumToArray)(enums_1.PostAudience);
const mediaType = (0, common_1.numberEnumToArray)(enums_1.MediaType);
exports.createPostValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    type: {
        isIn: {
            options: [postType],
            errorMessage: messages_1.POST_MESSAGE.INVALID_TYPE
        }
    },
    audience: {
        isIn: {
            options: [postAudience],
            errorMessage: messages_1.POST_MESSAGE.INVALID_AUDIENCE
        }
    },
    parent_id: {
        custom: {
            options: (value, { req }) => {
                const type = req.body.type;
                if ([enums_1.PostType.Repost, enums_1.PostType.Comment, enums_1.PostType.QuotePost].includes(type) && !mongodb_1.ObjectId.isValid(value)) {
                    throw new Error(messages_1.POST_MESSAGE.INVALID_PARENT_ID);
                }
                if (type === enums_1.PostType.Post && value !== null) {
                    throw new Error(messages_1.POST_MESSAGE.PARENT_ID_MUST_BE_NULL);
                }
                return true;
            }
        }
    },
    content: {
        isString: true,
        custom: {
            options: (value, { req }) => {
                const type = req.body.type;
                const hashtags = req.body.hashtags;
                const mentions = req.body.mentions;
                if ([enums_1.PostType.Post, enums_1.PostType.Comment, enums_1.PostType.QuotePost].includes(type) &&
                    (0, lodash_1.isEmpty)(hashtags) &&
                    (0, lodash_1.isEmpty)(mentions) &&
                    value === '') {
                    throw new Error(messages_1.POST_MESSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING);
                }
                if (type === enums_1.PostType.Repost && value !== '') {
                    throw new Error(messages_1.POST_MESSAGE.CONTENT_MUST_BE_A_EMPTY_STRING);
                }
                return true;
            }
        }
    },
    hashtags: {
        isArray: true,
        custom: {
            options: (value, { req }) => {
                if (!value.every((item) => typeof item === 'string')) {
                    throw new Error(messages_1.POST_MESSAGE.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
                }
                return true;
            }
        }
    },
    mentions: {
        isArray: true,
        custom: {
            options: (value, { req }) => {
                if (!value.every((item) => mongodb_1.ObjectId.isValid(item))) {
                    throw new Error(messages_1.POST_MESSAGE.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
                }
                return true;
            }
        }
    },
    medias: {
        isArray: true,
        custom: {
            options: (value) => {
                if (value.some((item) => {
                    console.log('item.type', item.type);
                    return typeof item.url !== 'string' || !mediaType.includes(item.type);
                })) {
                    throw new Error(messages_1.POST_MESSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT);
                }
                return true;
            }
        }
    }
}, ['body']));
exports.postIdValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    post_id: {
        custom: {
            options: async (value, { req }) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.POST_MESSAGE.INVALID_POST_ID,
                        status: httpStatus_1.default.BAD_REQUEST
                    });
                }
                const [post] = await database_services_1.default.posts
                    .aggregate([
                    {
                        $match: {
                            _id: new mongodb_1.ObjectId(value)
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user'
                        }
                    },
                    {
                        $lookup: {
                            from: 'hashtags',
                            localField: 'hashtags',
                            foreignField: '_id',
                            as: 'hashtags'
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'mentions',
                            foreignField: '_id',
                            as: 'mentions'
                        }
                    },
                    {
                        $addFields: {
                            mentions: {
                                $map: {
                                    input: '$mentions',
                                    as: 'mention',
                                    in: {
                                        _id: '$$mention._id',
                                        name: '$$mention.name',
                                        username: '$$mention.username',
                                        email: '$$mention.email'
                                    }
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'bookmarks',
                            localField: '_id',
                            foreignField: 'post_id',
                            as: 'bookmarks'
                        }
                    },
                    {
                        $lookup: {
                            from: 'likes',
                            localField: '_id',
                            foreignField: 'post_id',
                            as: 'likes'
                        }
                    },
                    {
                        $lookup: {
                            from: 'posts',
                            localField: '_id',
                            foreignField: 'parent_id',
                            as: 'posts_children'
                        }
                    },
                    {
                        $addFields: {
                            bookmarks: {
                                $size: '$bookmarks'
                            },
                            likes: {
                                $size: '$likes'
                            },
                            isLiked: {
                                $in: ['$user._id', '$likes.user_id']
                            },
                            isBookmark: {
                                $in: ['$user._id', '$bookmarks.user_id']
                            },
                            comment_count: {
                                $size: {
                                    $filter: {
                                        input: '$posts_children',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item.type', enums_1.PostType.Comment]
                                        }
                                    }
                                }
                            },
                            repost_count: {
                                $size: {
                                    $filter: {
                                        input: '$posts_children',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item.type', enums_1.PostType.Repost]
                                        }
                                    }
                                }
                            },
                            quote_count: {
                                $size: {
                                    $filter: {
                                        input: '$posts_children',
                                        as: 'item',
                                        cond: {
                                            $eq: ['$$item.type', enums_1.PostType.QuotePost]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            posts_children: 0
                        }
                    }
                ])
                    .toArray();
                if (!post) {
                    throw new Errors_1.ErrorWithStatus({
                        message: messages_1.POST_MESSAGE.POST_NOT_FOUND,
                        status: httpStatus_1.default.NOT_FOUND
                    });
                }
                ;
                req.post = post;
                return true;
            }
        }
    }
}, ['params', 'body']));
exports.audienceValidator = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const post = req.post;
    if (post.audience === enums_1.PostAudience.PostCircle) {
        // check login
        if (!req.decode_authorization) {
            throw new Errors_1.ErrorWithStatus({
                message: messages_1.USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus_1.default.UNAUTHORIZE
            });
        }
        const author = await database_services_1.default.users.findOne({
            _id: new mongodb_1.ObjectId(post.user_id)
        });
        // check account
        if (!author || author.verify === enums_1.UserVerifyStatus.Banned) {
            throw new Errors_1.ErrorWithStatus({
                message: messages_1.USER_MESSAGES.USER_NOT_FOUND,
                status: httpStatus_1.default.NOT_FOUND
            });
        }
        const { user_id } = req.decode_authorization;
        const isInPostCircle = author.post_circle.some((user_circle_id) => user_circle_id.equals(user_id));
        const isAuthor = author._id.equals(user_id);
        // check post circle
        if (!isAuthor && !isInPostCircle) {
            throw new Errors_1.ErrorWithStatus({
                message: messages_1.POST_MESSAGE.POST_IS_NOT_PUBLIC,
                status: httpStatus_1.default.FORBIDDEN
            });
        }
    }
    next();
});
exports.getPostChildrenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    post_type: {
        isIn: {
            options: [postType],
            errorMessage: messages_1.POST_MESSAGE.INVALID_TYPE
        }
    }
}, ['query']));
exports.paginationValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    limit: {
        isNumeric: true,
        custom: {
            options: async (value) => {
                const num = Number(value);
                if (num > 100) {
                    throw new Error('Maximum is 100');
                }
                return true;
            }
        }
    },
    page: {
        isNumeric: true,
        custom: {
            options: async (value) => {
                const num = Number(value);
                if (num < 1) {
                    throw new Error('Page >= 1');
                }
                return true;
            }
        }
    }
}, ['query']));
exports.mediasTypeValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    medias_type: {
        isIn: {
            options: [mediaType],
            errorMessage: messages_1.POST_MESSAGE.INVALID_TYPE
        }
    }
}, ['query']));
