"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_controllers_1 = require("../controllers/conversation.controllers");
const posts_middlewares_1 = require("../middlewares/posts.middlewares");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const express_1 = require("express");
const conversationRouter = (0, express_1.Router)();
conversationRouter.get('/receivers/:receiver_id', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, posts_middlewares_1.paginationValidator, users_middlewares_1.getConversationValidator, conversation_controllers_1.getConversationsController);
exports.default = conversationRouter;
