"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bookmark_schema_1 = __importDefault(require("../models/schemas/Bookmark.schema"));
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
class BookmarkService {
    async bookmarkPost(user_id, post_id) {
        const data = await database_services_1.default.bookmarks.findOneAndUpdate({
            user_id: new mongodb_1.ObjectId(user_id),
            post_id: new mongodb_1.ObjectId(post_id)
        }, {
            $setOnInsert: new Bookmark_schema_1.default({
                user_id: new mongodb_1.ObjectId(user_id),
                post_id: new mongodb_1.ObjectId(post_id)
            })
        }, {
            upsert: true,
            returnDocument: 'after'
        });
        return data;
    }
    async unbookmarkPost(user_id, post_id) {
        const data = await database_services_1.default.bookmarks.findOneAndDelete({
            user_id: new mongodb_1.ObjectId(user_id),
            post_id: new mongodb_1.ObjectId(post_id)
        });
        return data;
    }
}
const bookmarkService = new BookmarkService();
exports.default = bookmarkService;
