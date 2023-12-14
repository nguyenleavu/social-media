import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { MediaType, MediaTypeQuery, PeopleFollow, PostType } from '@/constants/enums'
import { map } from 'lodash'
import User from '@/models/schemas/User.schema'

class SearchService {
  async search({
    content,
    limit,
    page,
    user_id,
    media_type,
    people_follow
  }: {
    content: string
    limit: number
    page: number
    user_id: string
    media_type?: MediaTypeQuery
    people_follow?: PeopleFollow
  }) {
    const $match: any = {
      $text: {
        $search: content
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      }
      if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }

    if (people_follow && people_follow === PeopleFollow.Following) {
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
      $match['user_id'] = {
        $in: ids
      }
    }

    const [posts, total] = await Promise.all([
      databaseServices.posts
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
                        $in: [new ObjectId(user_id)]
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
                        $in: [new ObjectId(user_id)]
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

  async searchUsername({
    username,
    limit,
    page,
    user_id
  }: {
    username: string
    limit: number
    page: number
    user_id: string
  }) {
    const user_id_obj = new ObjectId(user_id)

    const [users, total] = await Promise.all([
      databaseServices.users
        .aggregate<User>([
          {
            $match: {
              $and: [
                {
                  username: {
                    $regex: username
                  }
                },
                {
                  _id: {
                    $ne: user_id_obj
                  }
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
      databaseServices.users
        .aggregate([
          {
            $match: {
              $and: [
                {
                  username: {
                    $regex: username
                  }
                },
                {
                  _id: {
                    $ne: user_id_obj
                  }
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
    return { data: users, total: total[0]?.total || 0 }
  }
}

const searchService = new SearchService()

export default searchService
