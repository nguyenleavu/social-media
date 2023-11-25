"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikePostController = exports.likePostController = void 0;
const messages_1 = require("../constants/messages");
const likes_services_1 = __importDefault(require("../services/likes.services"));
const likePostController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const data = await likes_services_1.default.likePost(user_id, req.params.post_id);
    return res.json({
        message: messages_1.LIKE_MESSAGE.LIKE_POST_SUCCESS,
        data
    });
};
exports.likePostController = likePostController;
const unlikePostController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    await likes_services_1.default.unlikePost(user_id, req.params.post_id);
    return res.json({
        message: messages_1.LIKE_MESSAGE.UNLIKE_POST_SUCCESS
    });
};
exports.unlikePostController = unlikePostController;
