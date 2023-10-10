"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_schema_1 = __importDefault(require("../models/schemas/Post.schema"));
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
const lodash_1 = require("lodash");
const Hashtag_schema_1 = __importDefault(require("../models/schemas/Hashtag.schema"));
const enums_1 = require("../constants/enums");
class PostsService {
    async checkAndCreateHashtags(hashtags) {
        const hashtagDocuments = await Promise.all((0, lodash_1.map)(hashtags, (hashtag) => database_services_1.default.hashtags.findOneAndUpdate({
            name: hashtag
        }, {
            $setOnInsert: new Hashtag_schema_1.default({ name: hashtag })
        }, {
            upsert: true,
            returnDocument: 'after'
        })));
        return (0, lodash_1.map)(hashtagDocuments, (hashtag) => new mongodb_1.ObjectId(hashtag?._id));
    }
    async createPost(user_id, body) {
        const hashtags = await this.checkAndCreateHashtags(body.hashtags);
        const data = await database_services_1.default.posts.insertOne(new Post_schema_1.default({
            audience: body.audience,
            content: body.content,
            hashtags: hashtags,
            mentions: body.mentions,
            medias: body.medias,
            parent_id: body.parent_id,
            type: body.type,
            user_id: new mongodb_1.ObjectId(user_id)
        }));
        const post = await database_services_1.default.posts.findOne({ _id: data.insertedId });
        return post;
    }
    async increaseView(post_id, user_id) {
        const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
        const data = await database_services_1.default.posts.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(post_id)
        }, {
            $inc: inc,
            $currentDate: {
                updated_at: true
            }
        }, {
            returnDocument: 'after'
        });
        return data;
    }
    async getPostChildren({ post_id, post_type, limit, page, user_id }) {
        const posts = await database_services_1.default.posts
            .aggregate([
            {
                $match: {
                    parent_id: new mongodb_1.ObjectId(post_id),
                    type: post_type
                }
            },
            {
                $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                }
            },
            {
                $addFields: {
                    mentions: {
                        $map: {
                            input: '$mentions',
                            as: 'mention',
                            in: {
                                _id: '$$mention._id',
                                name: '$$mention.name',
                                username: '$$mention.username',
                                email: '$$mention.email'
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'bookmarks'
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'post_id',
                    as: 'likes'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'posts_children'
                }
            },
            {
                $addFields: {
                    bookmarks: {
                        $size: '$bookmarks'
                    },
                    likes: {
                        $size: '$likes'
                    },
                    comment_count: {
                        $size: {
                            $filter: {
                                input: '$posts_children',
                                as: 'item',
                                cond: {
                                    $eq: ['$$item.type', enums_1.PostType.Comment]
                                }
                            }
                        }
                    },
                    repost_count: {
                        $size: {
                            $filter: {
                                input: '$posts_children',
                                as: 'item',
                                cond: {
                                    $eq: ['$$item.type', enums_1.PostType.Repost]
                                }
                            }
                        }
                    },
                    quote_count: {
                        $size: {
                            $filter: {
                                input: '$posts_children',
                                as: 'item',
                                cond: {
                                    $eq: ['$$item.type', enums_1.PostType.QuotePost]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    posts_children: 0
                }
            },
            {
                $skip: limit * (page - 1)
            },
            {
                $limit: limit
            }
        ])
            .toArray();
        const ids = posts.map((post) => post._id);
        const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
        const date = new Date();
        const [, total] = await Promise.all([
            database_services_1.default.posts.updateMany({
                _id: {
                    $in: ids
                }
            }, {
                $inc: inc,
                $set: {
                    updated_at: date
                }
            }),
            await database_services_1.default.posts.countDocuments({
                parent_id: new mongodb_1.ObjectId(post_id),
                type: post_type
            })
        ]);
        posts.forEach((post) => {
            post.updated_at = date;
            if (user_id) {
                post.user_views += 1;
            }
            else {
                post.guest_views += 1;
            }
        });
        return { data: posts, total };
    }
    async getNewFeeds({ user_id, limit, page }) {
        const user_id_obj = new mongodb_1.ObjectId(user_id);
        const followed_user_ids = await database_services_1.default.followers
            .find({
            user_id: user_id_obj
        }, {
            projection: {
                followed_user_id: 1,
                _id: 0
            }
        })
            .toArray();
        const ids = (0, lodash_1.map)(followed_user_ids, (item) => item.followed_user_id);
        ids.push(user_id_obj);
        const [posts, total] = await Promise.all([
            database_services_1.default.posts
                .aggregate([
                {
                    $match: {
                        user_id: {
                            $in: ids
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                audience: 0
                            },
                            {
                                $and: [
                                    {
                                        audience: 1
                                    },
                                    {
                                        'user.post_circle': {
                                            $in: [user_id_obj]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    $skip: limit * (page - 1)
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'hashtags',
                        localField: 'hashtags',
                        foreignField: '_id',
                        as: 'hashtags'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'mentions',
                        foreignField: '_id',
                        as: 'mentions'
                    }
                },
                {
                    $addFields: {
                        mentions: {
                            $map: {
                                input: '$mentions',
                                as: 'mention',
                                in: {
                                    _id: '$$mention._id',
                                    name: '$$mention.name',
                                    username: '$$mention.username',
                                    email: '$$mention.email'
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'bookmarks',
                        localField: '_id',
                        foreignField: 'post_id',
                        as: 'bookmarks'
                    }
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: '_id',
                        foreignField: 'post_id',
                        as: 'likes'
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'parent_id',
                        as: 'posts_children'
                    }
                },
                {
                    $addFields: {
                        bookmarks: {
                            $size: '$bookmarks'
                        },
                        likes: {
                            $size: '$likes'
                        },
                        comment_count: {
                            $size: {
                                $filter: {
                                    input: '$posts_children',
                                    as: 'item',
                                    cond: {
                                        $eq: ['$$item.type', enums_1.PostType.Comment]
                                    }
                                }
                            }
                        },
                        repost_count: {
                            $size: {
                                $filter: {
                                    input: '$posts_children',
                                    as: 'item',
                                    cond: {
                                        $eq: ['$$item.type', enums_1.PostType.Repost]
                                    }
                                }
                            }
                        },
                        quote_count: {
                            $size: {
                                $filter: {
                                    input: '$posts_children',
                                    as: 'item',
                                    cond: {
                                        $eq: ['$$item.type', enums_1.PostType.QuotePost]
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        posts_children: 0,
                        user: {
                            password: 0,
                            email_verify_token: 0,
                            forgot_password_token: 0,
                            post_circle: 0,
                            date_of_birth: 0
                        }
                    }
                }
            ])
                .toArray(),
            database_services_1.default.posts
                .aggregate([
                {
                    $match: {
                        user_id: {
                            $in: ids
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                audience: 0
                            },
                            {
                                $and: [
                                    {
                                        audience: 1
                                    },
                                    {
                                        'user.post_circle': {
                                            $in: [user_id_obj]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    $count: 'total'
                }
            ])
                .toArray()
        ]);
        const post_ids = (0, lodash_1.map)(posts, (post) => post._id);
        const date = new Date();
        await database_services_1.default.posts.updateMany({
            _id: {
                $in: post_ids
            }
        }, {
            $inc: { user_views: 1 },
            $set: {
                updated_at: date
            }
        });
        posts.forEach((post) => {
            post.updated_at = date;
            post.user_views += 1;
        });
        return { data: posts, total: total[0]?.total || 0 };
    }
}
const postsService = new PostsService();
exports.default = postsService;
