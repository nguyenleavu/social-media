"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const lodash_1 = require("lodash");
class Post {
    _id;
    user_id;
    type;
    audience;
    content;
    parent_id;
    hashtags;
    mentions;
    medias;
    guest_views;
    user_views;
    created_at;
    updated_at;
    constructor({ _id, audience, content, guest_views, hashtags, medias, mentions, parent_id, type, user_id, user_views, created_at, updated_at }) {
        const date = new Date();
        this._id = _id;
        this.user_id = user_id;
        this.type = type;
        this.audience = audience;
        this.content = content;
        this.parent_id = parent_id ? new mongodb_1.ObjectId(parent_id) : null;
        this.hashtags = hashtags;
        this.mentions = (0, lodash_1.map)(mentions, (item) => new mongodb_1.ObjectId(item));
        this.medias = medias;
        this.guest_views = guest_views || 0;
        this.user_views = user_views || 0;
        this.created_at = created_at || date;
        this.updated_at = updated_at || date;
    }
}
exports.default = Post;
