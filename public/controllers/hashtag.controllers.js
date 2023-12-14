"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashTagController = void 0;
const hashtag_services_1 = __importDefault(require("../services/hashtag.services"));
const hashTagController = async (req, res) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const content = req.query.content;
    const { data, total } = await hashtag_services_1.default.hashtag({
        limit,
        page,
        content
    });
    return res.json({
        message: 'Get hashtag success',
        data,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.hashTagController = hashTagController;
