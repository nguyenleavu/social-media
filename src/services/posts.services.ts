import { PostReqBody } from '@/models/requests/Posts.requests'
import Post from '@/models/schemas/Post.schema'
import databaseServices from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { map } from 'lodash'
import Hashtag from '@/models/schemas/Hashtag.schema'
import { PostType } from '@/constants/enums'

class PostsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      map(hashtags, (hashtag) =>
        databaseServices.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      )
    )
    return map(hashtagDocuments, (hashtag) => new ObjectId(hashtag?._id))
  }

  async createPost(user_id: string, body: PostReqBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const data = await databaseServices.posts.insertOne(
      new Post({
        audience: body.audience,
        content: body.content,
        hashtags: hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const post = await databaseServices.posts.findOne({ _id: data.insertedId })
    return post
  }

  async increaseView(post_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const data = await databaseServices.posts.findOneAndUpdate(
      {
        _id: new ObjectId(post_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return data
  }

  async getPostChildren({
    post_id,
    post_type,
    limit,
    page,
    user_id
  }: {
    post_id: string
    post_type: PostType
    limit: number
    page: number
    user_id?: string
  }) {
    const posts = await databaseServices.posts
      .aggregate<Post>([
        {
          $match: {
            parent_id: new ObjectId(post_id),
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
                    $eq: ['$$item.type', PostType.Comment]
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
                    $eq: ['$$item.type', PostType.Repost]
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
                    $eq: ['$$item.type', PostType.QuotePost]
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
      .toArray()

    const ids = posts.map((post) => post._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      databaseServices.posts.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseServices.posts.countDocuments({
        parent_id: new ObjectId(post_id),
        type: post_type
      })
    ])

    posts.forEach((post) => {
      post.updated_at = date
      if (user_id) {
        post.user_views += 1
      } else {
        post.guest_views += 1
      }
    })
    return { data: posts, total }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_obj = new ObjectId(user_id)
    const followed_user_ids = await databaseServices.followers
      .find(
        {
          user_id: user_id_obj
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()

    const ids = map(followed_user_ids, (item) => item.followed_user_id)
    ids.push(user_id_obj)

    const [posts, total] = await Promise.all([
      databaseServices.posts
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
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
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
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
                      $eq: ['$$item.type', PostType.Comment]
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
                      $eq: ['$$item.type', PostType.Repost]
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
                      $eq: ['$$item.type', PostType.QuotePost]
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
      databaseServices.posts
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
    ])
    const post_ids = map(posts, (post) => post._id as ObjectId)
    const date = new Date()
    await databaseServices.posts.updateMany(
      {
        _id: {
          $in: post_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    posts.forEach((post) => {
      post.updated_at = date
      post.user_views += 1
    })
    return { data: posts, total: total[0]?.total || 0 }
  }
}

const postsService = new PostsService()

export default postsService
