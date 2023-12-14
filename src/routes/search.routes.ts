import { searchController, searchUserController } from '@/controllers/search.controllers'
import { searchUserValidator, searchValidator } from '@/middlewares/search.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '@/middlewares/users.middlewares'
import { Router } from 'express'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, verifiedUserValidator, searchValidator, searchController)
searchRouter.get('/users', accessTokenValidator, verifiedUserValidator, searchUserValidator, searchUserController)

export default searchRouter
