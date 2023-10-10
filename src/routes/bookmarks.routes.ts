import { bookmarkPostController, unbookmarkPostController } from '@/controllers/bookmark.controllers'
import { postIdValidator } from '@/middlewares/posts.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'

const bookmarksRouter = Router()

bookmarksRouter.post(
  '/posts/:post_id',
  accessTokenValidator,
  verifiedUserValidator,
  postIdValidator,
  wrapRequestHandler(bookmarkPostController)
)
bookmarksRouter.delete(
  '/posts/:post_id',
  accessTokenValidator,
  verifiedUserValidator,
  postIdValidator,
  wrapRequestHandler(unbookmarkPostController)
)

export default bookmarksRouter
