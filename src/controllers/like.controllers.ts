import { LIKE_MESSAGE } from '@/constants/messages'
import { LikeReqParams } from '@/models/requests/Likes.request'
import { TokenPayload } from '@/models/requests/Users.requests'
import likeService from '@/services/likes.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const likePostController = async (req: Request<ParamsDictionary, any, LikeReqParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await likeService.likePost(user_id, req.params.post_id)
  return res.json({
    message: LIKE_MESSAGE.LIKE_POST_SUCCESS,
    data
  })
}

export const unlikePostController = async (req: Request<ParamsDictionary, any, LikeReqParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  await likeService.unlikePost(user_id, req.params.post_id)
  return res.json({
    message: LIKE_MESSAGE.UNLIKE_POST_SUCCESS
  })
}
