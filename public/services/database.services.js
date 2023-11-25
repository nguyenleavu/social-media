"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.sdo61bz.mongodb.net/?retryWrites=true&w=majority`;
class DatabaseService {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(process.env.DB_NAME);
    }
    async connect() {
        try {
            // Send a ping to confirm a successful connection
            await this.db.command({ ping: 1 });
            console.log('Pinged your deployment. You successfully connected to MongoDB!');
        }
        catch (error) {
            console.log('error', error);
            throw error;
        }
    }
    async indexUser() {
        const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1']);
        if (!exists) {
            this.users.createIndex({ email: 1, password: 1 });
            this.users.createIndex({ email: 1 }, { unique: true });
            this.users.createIndex({ username: 1 }, { unique: true });
        }
    }
    async indexRefreshToken() {
        const exists = await this.users.indexExists(['token_1', 'exp_1']);
        if (!exists) {
            this.refreshTokens.createIndex({ token: 1 });
            this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
        }
    }
    async indexVideoStatus() {
        const exists = await this.users.indexExists(['name_1']);
        if (!exists) {
            this.videoStatus.createIndex({ name: 1 });
        }
    }
    async indexFollowers() {
        const exists = await this.users.indexExists(['user_id_1_followed_user_id_1']);
        if (!exists) {
            this.followers.createIndex({ user_id: 1, followed_user_id: 1 });
        }
    }
    async indexPosts() {
        const exists = await this.users.indexExists(['content_text']);
        if (!exists) {
            this.posts.createIndex({ content: 'text' }, { default_language: 'none' });
        }
    }
    get users() {
        return this.db.collection(process.env.DB_USER_COLLECTION);
    }
    get posts() {
        return this.db.collection(process.env.DB_POSTS_COLLECTION);
    }
    get refreshTokens() {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION);
    }
    get followers() {
        return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION);
    }
    get videoStatus() {
        return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION);
    }
    get hashtags() {
        return this.db.collection(process.env.DB_HASHTAGS_COLLECTION);
    }
    get bookmarks() {
        return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION);
    }
    get likes() {
        return this.db.collection(process.env.DB_LIKES_COLLECTION);
    }
    get conversations() {
        return this.db.collection(process.env.DB_CONVERSATION_COLLECTION);
    }
}
const databaseServices = new DatabaseService();
exports.default = databaseServices;
