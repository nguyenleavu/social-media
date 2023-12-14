"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("./database.services"));
class HashtagService {
    async hashtag({ content, limit, page }) {
        const [hashtags, total] = await Promise.all([
            database_services_1.default.hashtags
                .aggregate([
                {
                    $match: {
                        name: {
                            $regex: content
                        }
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
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'hashtags',
                        as: 'posts'
                    }
                },
                {
                    $addFields: {
                        posts: {
                            $size: '$posts'
                        }
                    }
                }
            ])
                .toArray(),
            database_services_1.default.hashtags
                .aggregate([
                {
                    $match: {
                        name: {
                            $regex: content
                        }
                    }
                },
                {
                    $count: 'total'
                }
            ])
                .toArray()
        ]);
        return { data: hashtags, total: total[0]?.total || 0 };
    }
}
const hashtagService = new HashtagService();
exports.default = hashtagService;
