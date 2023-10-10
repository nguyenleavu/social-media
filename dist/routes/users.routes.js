"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_controllers_1 = require("../controllers/users.controllers");
const common_middlewares_1 = require("../middlewares/common.middlewares");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const handlers_1 = require("../utils/handlers");
const express_1 = require("express");
const usersRouter = (0, express_1.Router)();
usersRouter.post('/login', users_middlewares_1.loginValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.loginControllers));
usersRouter.get('/oauth/google', (0, handlers_1.wrapRequestHandler)(users_controllers_1.oauthController));
usersRouter.post('/register', users_middlewares_1.registerValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.registerControllers));
usersRouter.post('/logout', users_middlewares_1.accessTokenValidator, users_middlewares_1.refreshTokenValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.logoutController));
usersRouter.post('/refresh-token', users_middlewares_1.refreshTokenValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.refreshTokenController));
usersRouter.post('/email-verify', users_middlewares_1.emailVerifyTokenValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.emailVerifyController));
usersRouter.post('/resend-email-verify', users_middlewares_1.accessTokenValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.resendEmailVerifyController));
usersRouter.post('/forgot-password', users_middlewares_1.forgotPasswordValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.forgotPasswordController));
usersRouter.post('/forgot-password-verify', users_middlewares_1.verifyForgotPasswordValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.verifyForgotPasswordController));
usersRouter.post('/reset-password', users_middlewares_1.resetPasswordValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.resetPasswordController));
usersRouter.get('/me', users_middlewares_1.accessTokenValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.getMeController));
usersRouter.patch('/me', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.updateMeValidator, (0, common_middlewares_1.filterMiddleware)([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
]), (0, handlers_1.wrapRequestHandler)(users_controllers_1.updateMeController));
usersRouter.get('/:username', (0, handlers_1.wrapRequestHandler)(users_controllers_1.getProfileController));
usersRouter.post('/follow', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.followValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.followController));
usersRouter.delete('/follow/:user_id', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.unFollowValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.unFollowController));
usersRouter.put('/change-password', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.changePasswordValidator, (0, handlers_1.wrapRequestHandler)(users_controllers_1.changePasswordController));
exports.default = usersRouter;
