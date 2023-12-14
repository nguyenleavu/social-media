"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllController = exports.getNewFeedsController = exports.getPostChildrenController = exports.getPostController = exports.createPostController = void 0;
const posts_services_1 = __importDefault(require("../services/posts.services"));
const messages_1 = require("../constants/messages");
const createPostController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const data = await posts_services_1.default.createPost(user_id, req.body);
    return res.json({
        message: messages_1.POST_MESSAGE.CREATE_POST_SUCCESS,
        data
    });
};
exports.createPostController = createPostController;
const getPostController = async (req, res) => {
    const data = await posts_services_1.default.increaseView(req.params.post_id, req.decode_authorization?.user_id);
    const post = {
        ...req.post,
        guest_views: data?.guest_views,
        user_views: data?.user_views,
        updated_at: data?.updated_at
    };
    return res.json({
        message: messages_1.POST_MESSAGE.GET_POST_SUCCESS,
        data: post
    });
};
exports.getPostController = getPostController;
const getPostChildrenController = async (req, res) => {
    const post_type = Number(req.query.post_type);
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const user_id = req.decode_authorization?.user_id;
    const { data, total } = await posts_services_1.default.getPostChildren({
        post_id: req.params.post_id,
        post_type,
        limit,
        page,
        user_id
    });
    return res.json({
        message: messages_1.POST_MESSAGE.GET_POST_CHILDREN_SUCCESS,
        data,
        post_type,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.getPostChildrenController = getPostChildrenController;
const getNewFeedsController = async (req, res) => {
    const user_id = req.decode_authorization?.user_id;
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const { data, total } = await posts_services_1.default.getNewFeeds({
        user_id,
        limit,
        page
    });
    return res.json({
        message: messages_1.POST_MESSAGE.GET_NEWS_FEEDS_SUCCESS,
        data,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.getNewFeedsController = getNewFeedsController;
const getAllController = async (req, res) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const medias_type = Number(req.query.medias_type);
    const { data, total } = await posts_services_1.default.getAllMedia({
        limit,
        page,
        medias_type
    });
    return res.json({
        message: messages_1.POST_MESSAGE.GET_MEDIAS_SUCCESS,
        data,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.getAllController = getAllController;
