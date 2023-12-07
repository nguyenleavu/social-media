import { MediaType, PostAudience, PostType, UserVerifyStatus } from '@/constants/enums'
import HTTP_STATUS from '@/constants/httpStatus'
import { POST_MESSAGE, USER_MESSAGES } from '@/constants/messages'
import { ErrorWithStatus } from '@/models/Errors'
import { Media } from '@/models/Other'
import { TokenPayload } from '@/models/requests/Users.requests'
import Post from '@/models/schemas/Post.schema'
import databaseServices from '@/services/database.services'
import { numberEnumToArray } from '@/utils/common'
import { wrapRequestHandler } from '@/utils/handlers'
import { validate } from '@/utils/validation'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'

const postType = numberEnumToArray(PostType)
const postAudience = numberEnumToArray(PostAudience)
const mediaType = numberEnumToArray(MediaType)

export const createPostValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [postType],
          errorMessage: POST_MESSAGE.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [postAudience],
          errorMessage: POST_MESSAGE.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as PostType
            if ([PostType.Repost, PostType.Comment, PostType.QuotePost].includes(type) && !ObjectId.isValid(value)) {
              throw new Error(POST_MESSAGE.INVALID_PARENT_ID)
            }

            if (type === PostType.Post && value !== null) {
              throw new Error(POST_MESSAGE.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as PostType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            if (
              [PostType.Post, PostType.Comment, PostType.QuotePost].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(POST_MESSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            if (type === PostType.Repost && value !== '') {
              throw new Error(POST_MESSAGE.CONTENT_MUST_BE_A_EMPTY_STRING)
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (!value.every((item: any) => typeof item === 'string')) {
              throw new Error(POST_MESSAGE.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }

            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (!value.every((item: any) => ObjectId.isValid(item))) {
              throw new Error(POST_MESSAGE.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }

            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value) => {
            if (
              value.some((item: Media) => {
                console.log('item.type', item.type)
                return typeof item.url !== 'string' || !mediaType.includes(item.type)
              })
            ) {
              throw new Error(POST_MESSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const postIdValidator = validate(
  checkSchema(
    {
      post_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: POST_MESSAGE.INVALID_POST_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const { user_id } = req.decode_authorization as TokenPayload
            const [post] = await databaseServices.posts
              .aggregate<Post>([
                {
                  $match: {
                    _id: new ObjectId(value)
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
                    isLiked: {
                      $in: [user_id, '$likes.user_id']
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
                }
              ])
              .toArray()

            if (!post) {
              throw new ErrorWithStatus({
                message: POST_MESSAGE.POST_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            ;(req as Request).post = post
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const post = req.post as Post
  if (post.audience === PostAudience.PostCircle) {
    // check login
    if (!req.decode_authorization) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZE
      })
    }

    const author = await databaseServices.users.findOne({
      _id: new ObjectId(post.user_id)
    })
    // check account
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const { user_id } = req.decode_authorization
    const isInPostCircle = author.post_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    const isAuthor = author._id.equals(user_id)
    // check post circle
    if (!isAuthor && !isInPostCircle) {
      throw new ErrorWithStatus({
        message: POST_MESSAGE.POST_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  next()
})

export const getPostChildrenValidator = validate(
  checkSchema(
    {
      post_type: {
        isIn: {
          options: [postType],
          errorMessage: POST_MESSAGE.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value) => {
            const num = Number(value)
            if (num > 100) {
              throw new Error('Maximum is 100')
            }

            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('Page >= 1')
            }

            return true
          }
        }
      }
    },
    ['query']
  )
)
