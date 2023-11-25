"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Conversation {
    _id;
    sender_id;
    receiver_id;
    content;
    created_at;
    updated_at;
    constructor({ _id, sender_id, receiver_id, content, created_at, updated_at }) {
        const date = new Date();
        this._id = _id;
        this.sender_id = sender_id;
        this.content = content;
        this.receiver_id = receiver_id;
        this.created_at = created_at || date;
        this.updated_at = updated_at || date;
    }
}
exports.default = Conversation;
