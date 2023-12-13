import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginControllers,
  logoutController,
  oauthController,
  refreshTokenController,
  registerControllers,
  resendEmailVerifyController,
  resetPasswordController,
  suggestedController,
  unFollowController,
  updateMeController,
  verifyForgotPasswordController
} from '@/controllers/users.controllers'
import { filterMiddleware } from '@/middlewares/common.middlewares'
import { paginationValidator } from '@/middlewares/posts.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordValidator
} from '@/middlewares/users.middlewares'
import { UpdateMeReqBody } from '@/models/requests/Users.requests'
import { wrapRequestHandler } from '@/utils/handlers'
import { Router } from 'express'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginControllers))
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerControllers))
usersRouter.post('/logout', accessTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
usersRouter.post('/email-verify', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/forgot-password-verify',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)
usersRouter.get(
  '/suggested',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(suggestedController)
)
usersRouter.get('/:username', accessTokenValidator, wrapRequestHandler(getProfileController))
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
