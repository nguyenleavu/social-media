import { getConversationsController } from '@/controllers/conversation.controllers'
import { paginationValidator } from '@/middlewares/posts.middlewares'
import { accessTokenValidator, getConversationValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'

const conversationRouter = Router()

conversationRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationValidator,
  getConversationsController
)

export default conversationRouter
