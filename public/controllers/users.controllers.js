"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordController = exports.unFollowController = exports.followController = exports.getProfileController = exports.updateMeController = exports.getMeController = exports.resetPasswordController = exports.verifyForgotPasswordController = exports.forgotPasswordController = exports.resendEmailVerifyController = exports.emailVerifyController = exports.refreshTokenController = exports.logoutController = exports.registerControllers = exports.oauthController = exports.loginControllers = void 0;
const enums_1 = require("../constants/enums");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const messages_1 = require("../constants/messages");
const database_services_1 = __importDefault(require("../services/database.services"));
const users_services_1 = __importDefault(require("../services/users.services"));
const dotenv_1 = require("dotenv");
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
(0, dotenv_1.config)();
const loginControllers = async (req, res) => {
    const { user } = req;
    const user_id = user?._id;
    const data = await users_services_1.default.login({ user_id: user_id.toString(), verify: user?.verify });
    return res.json({
        message: messages_1.USER_MESSAGES.LOGIN_SUCCESS,
        data
    });
};
exports.loginControllers = loginControllers;
const oauthController = async (req, res) => {
    const { code } = req.query;
    const data = await users_services_1.default.oauth(code);
    const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&new_user=${data.newUser}&verify=${data.verify}`;
    return res.redirect(urlRedirect);
};
exports.oauthController = oauthController;
const registerControllers = async (req, res) => {
    const data = await users_services_1.default.register(req.body);
    return res.json({
        message: messages_1.USER_MESSAGES.REGISTER_SUCCESS,
        data
    });
};
exports.registerControllers = registerControllers;
const logoutController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const data = await users_services_1.default.logout(user_id);
    return res.json(data);
};
exports.logoutController = logoutController;
const refreshTokenController = async (req, res) => {
    const { refresh_token } = req.body;
    const { user_id, verify, exp } = req.decode_refresh_token;
    const data = await users_services_1.default.refreshToken({ user_id, verify, refresh_token, exp });
    return res.json({
        message: messages_1.USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
        data
    });
};
exports.refreshTokenController = refreshTokenController;
const emailVerifyController = async (req, res) => {
    const { user_id } = req.decode_email_verify_token;
    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if ((0, lodash_1.isEmpty)(user)) {
        return res.status(httpStatus_1.default.NOT_FOUND).json({
            message: messages_1.USER_MESSAGES.USER_NOT_FOUND
        });
    }
    if ((0, lodash_1.isEmpty)(user.email_verify_token)) {
        return res.status(httpStatus_1.default.OK).json({
            message: messages_1.USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        });
    }
    const data = await users_services_1.default.verifyEmail(user_id);
    return res.json({
        message: messages_1.USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
        data
    });
};
exports.emailVerifyController = emailVerifyController;
const resendEmailVerifyController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if ((0, lodash_1.isEmpty)(user)) {
        return res.status(httpStatus_1.default.NOT_FOUND).json({
            message: messages_1.USER_MESSAGES.USER_NOT_FOUND
        });
    }
    if (user.verify === enums_1.UserVerifyStatus.Verified) {
        return res.json({
            message: messages_1.USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        });
    }
    const data = await users_services_1.default.resendVerifyEmail(user_id, user.email);
    return res.json(data);
};
exports.resendEmailVerifyController = resendEmailVerifyController;
const forgotPasswordController = async (req, res) => {
    const { _id, verify, email } = req.user;
    const data = await users_services_1.default.forgotPassword({
        user_id: _id?.toString(),
        verify,
        email
    });
    return res.json(data);
};
exports.forgotPasswordController = forgotPasswordController;
const verifyForgotPasswordController = async (req, res) => {
    return res.json({
        message: messages_1.USER_MESSAGES.FORGOT_PASSWORD_TOKEN_VERIFY_SUCCESS
    });
};
exports.verifyForgotPasswordController = verifyForgotPasswordController;
const resetPasswordController = async (req, res) => {
    const { user_id } = req.decode_forgot_password_token;
    const { password } = req.body;
    const data = await users_services_1.default.resetPassword(user_id, password);
    return res.json(data);
};
exports.resetPasswordController = resetPasswordController;
const getMeController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const user = await users_services_1.default.getMe(user_id);
    return res.json({
        message: messages_1.USER_MESSAGES.GET_MET_SUCCESS,
        data: user
    });
};
exports.getMeController = getMeController;
const updateMeController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { body } = req;
    const user = await users_services_1.default.updateMe(user_id, body);
    return res.json({
        message: messages_1.USER_MESSAGES.UPDATE_ME_SUCCESS,
        data: user
    });
};
exports.updateMeController = updateMeController;
const getProfileController = async (req, res) => {
    const { username } = req.params;
    const { user_id } = req.decode_authorization;
    const user = await users_services_1.default.getProfile(username, user_id);
    return res.json({
        message: messages_1.USER_MESSAGES.GET_PROFILE_SUCCESS,
        data: user
    });
};
exports.getProfileController = getProfileController;
const followController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { followed_user_id } = req.body;
    const data = await users_services_1.default.follow(user_id, followed_user_id);
    return res.json(data);
};
exports.followController = followController;
const unFollowController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { user_id: followed_user_id } = req.params;
    const data = await users_services_1.default.unFollow(user_id, followed_user_id);
    return res.json(data);
};
exports.unFollowController = unFollowController;
const changePasswordController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { new_password } = req.body;
    const user = await users_services_1.default.changePassword(user_id, new_password);
    return res.json(user);
};
exports.changePasswordController = changePasswordController;
