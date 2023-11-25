"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationsController = void 0;
const conversations_services_1 = __importDefault(require("../services/conversations.services"));
const getConversationsController = async (req, res) => {
    const { receiver_id } = req.params;
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    const sender_id = req.decode_authorization?.user_id;
    const { data, total } = await conversations_services_1.default.getConversations({
        receiver_id,
        sender_id,
        limit,
        page
    });
    return res.json({
        message: 'Get conversation success',
        data,
        limit,
        page,
        total_page: Math.ceil(total / limit)
    });
};
exports.getConversationsController = getConversationsController;
