"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const enums_1 = require("../constants/enums");
const lodash_1 = require("lodash");
class SearchService {
    async search({ content, limit, page, user_id, media_type, people_follow }) {
        const $match = {
            $text: {
                $search: content
            }
        };
        if (media_type) {
            if (media_type === enums_1.MediaTypeQuery.Image) {
                $match['medias.type'] = enums_1.MediaType.Image;
            }
            if (media_type === enums_1.MediaTypeQuery.Video) {
                $match['medias.type'] = {
                    $in: [enums_1.MediaType.Video, enums_1.MediaType.HLS]
                };
            }
        }
        if (people_follow && people_follow === enums_1.PeopleFollow.Following) {
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
            $match['user_id'] = {
                $in: ids
            };
        }
        const [posts, total] = await Promise.all([
            database_services_1.default.posts
                .aggregate([
                {
                    $match
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
                                            $in: [new mongodb_1.ObjectId(user_id)]
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
                    $match
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
                                            $in: [new mongodb_1.ObjectId(user_id)]
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
const searchService = new SearchService();
exports.default = searchService;
