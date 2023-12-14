import { hashTagController } from '@/controllers/hashtag.controllers'
import { hashtagValidator } from '@/middlewares/hashtag.middlewares'
import { Router } from 'express'

const hashtagRouter = Router()

hashtagRouter.get('/', hashtagValidator, hashTagController)

export default hashtagRouter
