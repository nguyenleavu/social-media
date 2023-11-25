"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
class ConversationService {
    async getConversations({ sender_id, receiver_id, limit, page }) {
        const match = {
            $or: [
                {
                    sender_id: new mongodb_1.ObjectId(sender_id),
                    receiver_id: new mongodb_1.ObjectId(receiver_id)
                },
                {
                    sender_id: new mongodb_1.ObjectId(receiver_id),
                    receiver_id: new mongodb_1.ObjectId(sender_id)
                }
            ]
        };
        const data = await database_services_1.default.conversations
            .find(match)
            .sort({ created_at: -1 })
            .skip(limit * (page - 1))
            .limit(limit)
            .toArray();
        const total = await database_services_1.default.conversations.countDocuments(match);
        return {
            data,
            total
        };
    }
}
const conversationService = new ConversationService();
exports.default = conversationService;
