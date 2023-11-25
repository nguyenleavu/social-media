"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Like_schema_1 = __importDefault(require("../models/schemas/Like.schema"));
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
class LikeService {
    async likePost(user_id, post_id) {
        const data = await database_services_1.default.likes.findOneAndUpdate({
            user_id: new mongodb_1.ObjectId(user_id),
            post_id: new mongodb_1.ObjectId(post_id)
        }, {
            $setOnInsert: new Like_schema_1.default({
                user_id: new mongodb_1.ObjectId(user_id),
                post_id: new mongodb_1.ObjectId(post_id)
            })
        }, {
            upsert: true,
            returnDocument: 'after'
        });
        return data;
    }
    async unlikePost(user_id, post_id) {
        const data = await database_services_1.default.likes.findOneAndDelete({
            user_id: new mongodb_1.ObjectId(user_id),
            post_id: new mongodb_1.ObjectId(post_id)
        });
        return data;
    }
}
const likeService = new LikeService();
exports.default = likeService;
