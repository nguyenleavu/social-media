import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { PostReqBody } from '@/models/requests/Posts.requests'
import postsService from '@/services/posts.services'
import { TokenPayload } from '@/models/requests/Users.requests'
import { POST_MESSAGE } from '@/constants/messages'
import { PostType } from '@/constants/enums'

export const createPostController = async (req: Request<ParamsDictionary, any, PostReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await postsService.createPost(user_id, req.body)
  return res.json({
    message: POST_MESSAGE.CREATE_POST_SUCCESS,
    data
  })
}

export const getPostController = async (req: Request, res: Response) => {
  const data = await postsService.increaseView(req.params.post_id, req.decode_authorization?.user_id)
  const post = {
    ...req.post,
    guest_views: data?.guest_views,
    user_views: data?.user_views,
    updated_at: data?.updated_at
  }

  return res.json({
    message: POST_MESSAGE.GET_POST_SUCCESS,
    data: post
  })
}

export const getPostChildrenController = async (req: Request, res: Response) => {
  const post_type = Number(req.query.post_type) as PostType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decode_authorization?.user_id

  const { data, total } = await postsService.getPostChildren({
    post_id: req.params.post_id,
    post_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: POST_MESSAGE.GET_POST_CHILDREN_SUCCESS,
    data,
    post_type,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}

export const getNewFeedsController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { data, total } = await postsService.getNewFeeds({
    user_id,
    limit,
    page
  })
  return res.json({
    message: POST_MESSAGE.GET_NEWS_FEEDS_SUCCESS,
    data,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}

export const getAllController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const medias_type = Number(req.query.medias_type)

  const { data, total } = await postsService.getAllMedia({
    limit,
    page,
    medias_type,
    user_id
  })
  return res.json({
    message: POST_MESSAGE.GET_MEDIAS_SUCCESS,
    data,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
