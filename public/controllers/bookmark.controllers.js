"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbookmarkPostController = exports.bookmarkPostController = void 0;
const messages_1 = require("../constants/messages");
const bookmarks_services_1 = __importDefault(require("../services/bookmarks.services"));
const bookmarkPostController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const data = await bookmarks_services_1.default.bookmarkPost(user_id, req.params.post_id);
    return res.json({
        message: messages_1.BOOKMARK_MESSAGE.BOOKMARK_SUCCESS,
        data
    });
};
exports.bookmarkPostController = bookmarkPostController;
const unbookmarkPostController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    await bookmarks_services_1.default.unbookmarkPost(user_id, req.params.post_id);
    return res.json({
        message: messages_1.BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESS
    });
};
exports.unbookmarkPostController = unbookmarkPostController;
