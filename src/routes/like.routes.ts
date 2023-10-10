import { likePostController, unlikePostController } from '@/controllers/like.controllers'
import { postIdValidator } from '@/middlewares/posts.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'

const likesRouter = Router()

likesRouter.post(
  '/posts/:post_id',
  accessTokenValidator,
  verifiedUserValidator,
  postIdValidator,
  wrapRequestHandler(likePostController)
)
likesRouter.delete(
  '/posts/:post_id',
  accessTokenValidator,
  verifiedUserValidator,
  postIdValidator,
  wrapRequestHandler(unlikePostController)
)

export default likesRouter
