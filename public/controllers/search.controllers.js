"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const searchs_services_1 = __importDefault(require("../services/searchs.services"));
const searchController = async (req, res) => {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const content = req.query.content;
    const user_id = req.decode_authorization?.user_id;
    const media_type = req.query.media_type;
    const people_follow = req.query.people_follow;
    const { data, total } = await searchs_services_1.default.search({
        limit,
        page,
        content,
        media_type,
        people_follow,
        user_id
    });
    return res.json({
        message: 'Oke',
        data,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.searchController = searchController;
