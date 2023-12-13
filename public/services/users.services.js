"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../constants/enums");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const Errors_1 = require("../models/Errors");
const Follower_schema_1 = __importDefault(require("../models/schemas/Follower.schema"));
const RefreshToken_schema_1 = __importDefault(require("../models/schemas/RefreshToken.schema"));
const User_schema_1 = __importDefault(require("../models/schemas/User.schema"));
const crypto_1 = require("../utils/crypto");
const jwt_1 = require("../utils/jwt");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const email_1 = require("../utils/email");
(0, dotenv_1.config)();
class UsersService {
    signAccessToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                tokenType: enums_1.TokenType.AccessToken,
                verify
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        });
    }
    signRefreshToken({ user_id, verify, exp }) {
        if (exp) {
            return (0, jwt_1.signToken)({
                payload: {
                    user_id,
                    verify,
                    tokenType: enums_1.TokenType.RefreshToken,
                    exp
                },
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN
            });
        }
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                tokenType: enums_1.TokenType.RefreshToken
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        });
    }
    signEmailVerifyToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                tokenType: enums_1.TokenType.EmailVerifyToken
            },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
            options: {
                expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
            }
        });
    }
    signForgotPasswordToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                verify,
                tokenType: enums_1.TokenType.ForgotPasswordToken
            },
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
            options: {
                expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
            }
        });
    }
    signAccessAndRefreshToken({ user_id, verify }) {
        return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })]);
    }
    async getOAuthGoogleToken(code) {
        const body = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        };
        const { data } = await axios_1.default.post(process.env.GOOGLE_URL_TOKEN, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return data;
    }
    async getGoogleUserInfo(access_token, id_token) {
        const { data } = await axios_1.default.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            params: {
                access_token,
                alt: 'json'
            },
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        return data;
    }
    decodeRefreshToken(refresh_token) {
        return (0, jwt_1.verifyToken)({
            token: refresh_token,
            secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN
        });
    }
    async register(payload) {
        const user_id = new mongodb_1.ObjectId();
        const email_verify_token = await this.signEmailVerifyToken({
            user_id: user_id.toString(),
            verify: enums_1.UserVerifyStatus.Unverified
        });
        const nanoId = (await import('nanoid')).nanoid;
        const idName = nanoId();
        const avatar = 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/16f5ccab09a4d9bc58768b400.jpg';
        await database_services_1.default.users.insertOne(new User_schema_1.default({
            ...payload,
            _id: user_id,
            email_verify_token,
            avatar,
            post_circle: [user_id],
            date_of_birth: new Date(payload.date_of_birth),
            password: (0, crypto_1.hasPassword)(payload.password),
            username: `user_${idName}`
        }));
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
            user_id: user_id.toString(),
            verify: enums_1.UserVerifyStatus.Unverified
        });
        const { iat, exp } = await this.decodeRefreshToken(refresh_token);
        await database_services_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token, iat, exp }));
        await (0, email_1.sendVerifyRegisterEmail)(payload.email, email_verify_token);
        return {
            access_token,
            refresh_token
        };
    }
    async checkEmailExist(email) {
        const user = await database_services_1.default.users.findOne({ email });
        return Boolean(user);
    }
    async login({ user_id, verify }) {
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
            user_id: user_id.toString(),
            verify
        });
        const { iat, exp } = await this.decodeRefreshToken(refresh_token);
        await database_services_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token, iat, exp }));
        return { access_token, refresh_token };
    }
    async oauth(code) {
        const { id_token, access_token } = await this.getOAuthGoogleToken(code);
        const userInfo = await this.getGoogleUserInfo(access_token, id_token);
        if (!userInfo.verified_email) {
            throw new Errors_1.ErrorWithStatus({
                message: messages_1.USER_MESSAGES.GMAIL_NOT_VERIFY,
                status: httpStatus_1.default.BAD_REQUEST
            });
        }
        const user = await database_services_1.default.users.findOne({ email: userInfo.email });
        if (user) {
            const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
                user_id: user._id.toString(),
                verify: user.verify
            });
            const { iat, exp } = await this.decodeRefreshToken(refresh_token);
            await database_services_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user._id), token: refresh_token, iat, exp }));
            return { access_token, refresh_token, newUser: 0, verify: user.verify };
        }
        else {
            const password = Math.random().toString(36).substring(20);
            const data = await this.register({
                email: userInfo.email,
                name: userInfo.name,
                date_of_birth: new Date().toISOString(),
                password,
                confirm_password: password
            });
            return { ...data, newUser: 1, verify: enums_1.UserVerifyStatus.Unverified };
        }
    }
    async logout(user_id) {
        await database_services_1.default.refreshTokens.deleteOne({ _id: new mongodb_1.ObjectId(user_id) });
        return {
            message: messages_1.USER_MESSAGES.LOGOUT_SUCCESS
        };
    }
    async refreshToken({ user_id, verify, refresh_token, exp }) {
        const [new_access_token, new_refresh_token] = await Promise.all([
            this.signAccessToken({ user_id, verify }),
            this.signRefreshToken({ user_id, verify, exp }),
            database_services_1.default.refreshTokens.deleteOne({ token: refresh_token })
        ]);
        const decodeRefreshToken = await this.decodeRefreshToken(new_refresh_token);
        await database_services_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({
            user_id: new mongodb_1.ObjectId(user_id),
            token: new_refresh_token,
            iat: decodeRefreshToken.iat,
            exp: decodeRefreshToken.exp
        }));
        return {
            access_token: new_access_token,
            refresh_token: new_refresh_token
        };
    }
    async verifyEmail(user_id) {
        const [token] = await Promise.all([
            this.signAccessAndRefreshToken({ user_id, verify: enums_1.UserVerifyStatus.Verified }),
            database_services_1.default.users.updateOne({
                _id: new mongodb_1.ObjectId(user_id)
            }, [
                {
                    $set: {
                        email_verify_token: '',
                        verify: enums_1.UserVerifyStatus.Verified,
                        updated_at: '$$NOW'
                    }
                }
            ])
        ]);
        const [access_token, refresh_token] = token;
        const { iat, exp } = await this.decodeRefreshToken(refresh_token);
        await database_services_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token, iat, exp }));
        return {
            access_token,
            refresh_token
        };
    }
    async resendVerifyEmail(user_id, email) {
        const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: enums_1.UserVerifyStatus.Unverified });
        await (0, email_1.sendVerifyRegisterEmail)(email, email_verify_token);
        await database_services_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, [
            {
                $set: {
                    email_verify_token,
                    updated_at: '$$NOW'
                }
            }
        ]);
        return {
            message: messages_1.USER_MESSAGES.RESEND_EMAIL_VERIFY_TOKEN_SUCCESS
        };
    }
    async forgotPassword({ user_id, verify, email }) {
        const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify });
        await database_services_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, [
            { $set: { forgot_password_token, updated_at: '$$NOW' } }
        ]);
        await (0, email_1.sendForgotPasswordEmail)(email, forgot_password_token);
        return {
            message: messages_1.USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
        };
    }
    async resetPassword(user_id, password) {
        await database_services_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, [
            {
                $set: {
                    forgot_password_token: '',
                    password: (0, crypto_1.hasPassword)(password),
                    updated_at: '$$NOW'
                }
            }
        ]);
        return {
            message: messages_1.USER_MESSAGES.RESET_PASSWORD_SUCCESS
        };
    }
    async getMe(user_id) {
        const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } });
        return user;
    }
    async updateMe(user_id, body) {
        const _body = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : body;
        const user = await database_services_1.default.users.findOneAndUpdate({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: {
                ..._body
            },
            $currentDate: {
                updated_at: true
            }
        }, {
            returnDocument: 'after',
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0
            }
        });
        return user;
    }
    async getProfile(username, user_id) {
        const [user] = await database_services_1.default.users
            .aggregate([
            {
                $match: {
                    username
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'posts',
                    pipeline: [
                        {
                            $match: {
                                type: { $in: [enums_1.PostType.Post, enums_1.PostType.QuotePost, enums_1.PostType.Repost] }
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
                                }
                            }
                        },
                        {
                            $project: {
                                posts_children: 0
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'bookmarks'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'bookmarks.post_id',
                    foreignField: '_id',
                    as: 'bookmarks',
                    pipeline: [
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
                                from: 'posts',
                                localField: '_id',
                                foreignField: 'parent_id',
                                as: 'posts_children'
                            }
                        },
                        {
                            $addFields: {
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
                                }
                            }
                        },
                        {
                            $project: {
                                posts_children: 0,
                                user: {
                                    password: 0,
                                    email_verify_token: 0,
                                    forgot_password_token: 0,
                                    post_circle: 0,
                                    date_of_birth: 0
                                }
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'followers',
                    localField: '_id',
                    foreignField: 'followed_user_id',
                    as: 'followers'
                }
            },
            {
                $lookup: {
                    from: 'followers',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'following'
                }
            },
            {
                $addFields: {
                    followers: {
                        $size: '$followers'
                    },
                    following: {
                        $size: '$following'
                    },
                    isFollowing: {
                        $in: [new mongodb_1.ObjectId(user_id), '$followers.user_id']
                    }
                }
            },
            {
                $project: {
                    post_circle: 0,
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            }
        ])
            .toArray();
        return user;
    }
    async follow(user_id, followed_user_id) {
        const follower = await database_services_1.default.followers.findOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        if ((0, lodash_1.isEmpty)(follower)) {
            await database_services_1.default.followers.insertOne(new Follower_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), followed_user_id: new mongodb_1.ObjectId(followed_user_id) }));
            return {
                message: messages_1.USER_MESSAGES.FOLLOW_SUCCESS
            };
        }
        return { message: messages_1.USER_MESSAGES.FOLLOWED };
    }
    async unFollow(user_id, followed_user_id) {
        const follower = await database_services_1.default.followers.findOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        if ((0, lodash_1.isEmpty)(follower)) {
            return { message: messages_1.USER_MESSAGES.ALREADY_UN_FOLLOWED };
        }
        await database_services_1.default.followers.deleteOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        return { message: messages_1.USER_MESSAGES.UN_FOLLOW_SUCCESS };
    }
    async changePassword(user_id, new_password) {
        await database_services_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: {
                password: (0, crypto_1.hasPassword)(new_password)
            },
            $currentDate: {
                updated_at: true
            }
        });
        return {
            message: messages_1.USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
        };
    }
    async suggested({ limit, page, user_id }) {
        const user_id_obj = new mongodb_1.ObjectId(user_id);
        const followed_user_ids = await database_services_1.default.followers
            .find({
            user_id: user_id_obj
        }, {
            projection: {
                followed_user_id: 1,
                _id: 0
            }
        })
            .toArray();
        const ids = (0, lodash_1.map)(followed_user_ids, (item) => item.followed_user_id);
        const users = await database_services_1.default.users
            .aggregate([
            {
                $match: {
                    _id: {
                        $nin: ids,
                        $ne: user_id_obj
                    }
                }
            },
            {
                $skip: limit * (page - 1)
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'followers',
                    localField: '_id',
                    foreignField: 'followed_user_id',
                    as: 'followers'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    count: {
                        $sum: {
                            $size: '$followers'
                        }
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                post_circle: 0,
                                password: 0,
                                email_verify_token: 0,
                                forgot_password_token: 0
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$user'
                }
            }
        ])
            .toArray();
        return { data: users, total: ids.length };
    }
}
const usersService = new UsersService();
exports.default = usersService;
