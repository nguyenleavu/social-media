import {
  createPostController,
  getNewFeedsController,
  getPostChildrenController,
  getPostController
} from '@/controllers/posts.controller'
import {
  audienceValidator,
  createPostValidator,
  getPostChildrenValidator,
  paginationValidator,
  postIdValidator
} from '@/middlewares/posts.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'

const postsRouter = Router()

postsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createPostValidator,
  wrapRequestHandler(createPostController)
)

postsRouter.get(
  '/:post_id',
  accessTokenValidator,
  postIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getPostController)
)

postsRouter.get(
  '/:post_id/children',
  postIdValidator,
  paginationValidator,
  getPostChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getPostChildrenController)
)

postsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default postsRouter
