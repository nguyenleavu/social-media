"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Follower {
    _id;
    user_id;
    followed_user_id;
    created_at;
    constructor({ _id, followed_user_id, created_at, user_id }) {
        this._id = _id;
        this.user_id = user_id;
        this.followed_user_id = followed_user_id;
        this.created_at = created_at || new Date();
    }
}
exports.default = Follower;
