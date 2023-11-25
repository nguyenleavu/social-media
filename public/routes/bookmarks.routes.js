"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookmark_controllers_1 = require("../controllers/bookmark.controllers");
const posts_middlewares_1 = require("../middlewares/posts.middlewares");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const handlers_1 = require("../utils/handlers");
const express_1 = require("express");
const bookmarksRouter = (0, express_1.Router)();
bookmarksRouter.post('/posts/:post_id', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, posts_middlewares_1.postIdValidator, (0, handlers_1.wrapRequestHandler)(bookmark_controllers_1.bookmarkPostController));
bookmarksRouter.delete('/posts/:post_id', users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, posts_middlewares_1.postIdValidator, (0, handlers_1.wrapRequestHandler)(bookmark_controllers_1.unbookmarkPostController));
exports.default = bookmarksRouter;