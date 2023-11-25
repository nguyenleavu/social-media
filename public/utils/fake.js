"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../constants/enums");
const User_schema_1 = __importDefault(require("../models/schemas/User.schema"));
const database_services_1 = __importDefault(require("../services/database.services"));
const faker_1 = require("@faker-js/faker");
const mongodb_1 = require("mongodb");
const crypto_1 = require("./crypto");
const Follower_schema_1 = __importDefault(require("../models/schemas/Follower.schema"));
const posts_services_1 = __importDefault(require("../services/posts.services"));
const PASSWORD = '123456789aA@';
const MY_ID = new mongodb_1.ObjectId('651680e0f348fda0b9288712');
const USER_COUNT = 1000;
const createRandomUser = () => {
    const user = {
        name: faker_1.faker.internet.displayName(),
        email: faker_1.faker.internet.email(),
        password: PASSWORD,
        confirm_password: PASSWORD,
        date_of_birth: faker_1.faker.date.past().toISOString()
    };
    return user;
};
const createRandomPost = () => {
    const posts = {
        type: enums_1.PostType.Post,
        audience: enums_1.PostAudience.Everyone,
        content: faker_1.faker.lorem.paragraph({ min: 20, max: 160 }),
        hashtags: [],
        mentions: [],
        medias: [],
        parent_id: null
    };
    return posts;
};
const users = faker_1.faker.helpers.multiple(createRandomUser, { count: USER_COUNT });
const insertMultipleUsers = async (users) => {
    const result = await Promise.all(users.map(async (user) => {
        const user_id = new mongodb_1.ObjectId();
        await database_services_1.default.users.insertOne(new User_schema_1.default({
            ...user,
            username: `user${user_id.toString()}`,
            password: (0, crypto_1.hasPassword)(user.password),
            date_of_birth: new Date(user.date_of_birth),
            verify: enums_1.UserVerifyStatus.Verified
        }));
        return user_id;
    }));
    return result;
};
const followMultipleUsers = async (user_id, followed_user_ids) => {
    const result = await Promise.all(followed_user_ids.map((followed_user_id) => database_services_1.default.followers.insertOne(new Follower_schema_1.default({
        user_id,
        followed_user_id: new mongodb_1.ObjectId(followed_user_id)
    }))));
};
const insertMultiplePost = async (ids) => {
    let count = 0;
    const result = await Promise.all(ids.map(async (id, index) => {
        await Promise.all([
            posts_services_1.default.createPost(id.toString(), createRandomPost()),
            posts_services_1.default.createPost(id.toString(), createRandomPost())
        ]);
        count += 2;
        console.log(`Create ${count} posts`);
    }));
    return result;
};
insertMultipleUsers(users).then((ids) => {
    followMultipleUsers(new mongodb_1.ObjectId(MY_ID), ids);
    insertMultiplePost(ids);
});
