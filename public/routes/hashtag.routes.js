"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hashtag_controllers_1 = require("../controllers/hashtag.controllers");
const hashtag_middlewares_1 = require("../middlewares/hashtag.middlewares");
const express_1 = require("express");
const hashtagRouter = (0, express_1.Router)();
hashtagRouter.get('/', hashtag_middlewares_1.hashtagValidator, hashtag_controllers_1.hashTagController);
exports.default = hashtagRouter;
