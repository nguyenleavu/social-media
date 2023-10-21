import { UserVerifyStatus } from '@/constants/enums'
import HTTP_STATUS from '@/constants/httpStatus'
import { USER_MESSAGES } from '@/constants/messages'
import {
  ChangePasswordReqBody,
  EmailVerifyReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  ForgotPasswordVerifyReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody
} from '@/models/requests/users.requests'
import User from '@/models/schemas/User.schema'
import databaseServices from '@/services/database.services'
import usersService from '@/services/users.services'
import { config } from 'dotenv'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
config()

export const loginControllers = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const { user } = req
  const user_id = user?._id as ObjectId
  const data = await usersService.login({ user_id: user_id.toString(), verify: user?.verify as UserVerifyStatus })
  return res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    data
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const data = await usersService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&new_user=${data.newUser}&verify=${data.verify}`
  return res.redirect(urlRedirect)
}

export const registerControllers = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const data = await usersService.register(req.body)
  return res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    data
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await usersService.logout(user_id)
  return res.json(data)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decode_refresh_token as TokenPayload
  const data = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data
  })
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, EmailVerifyReqBody>, res: Response) => {
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })

  if (isEmpty(user)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }

  if (isEmpty(user.email_verify_token)) {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const data = await usersService.verifyEmail(user_id)
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    data
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })

  if (isEmpty(user)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const data = await usersService.resendVerifyEmail(user_id, user.email)
  return res.json(data)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify, email } = req.user as User
  const data = await usersService.forgotPassword({
    user_id: (_id as ObjectId)?.toString(),
    verify,
    email
  })
  return res.json(data)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordVerifyReqBody>,
  res: Response
) => {
  return res.json({
    message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_VERIFY_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const data = await usersService.resetPassword(user_id, password)
  return res.json(data)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USER_MESSAGES.GET_MET_SUCCESS,
    data: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)

  return res.json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    data: user
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    data: user
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.body
  const data = await usersService.follow(user_id, followed_user_id)
  return res.json(data)
}

export const unFollowController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const data = await usersService.unFollow(user_id, followed_user_id)
  return res.json(data)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { new_password } = req.body
  const user = await usersService.changePassword(user_id, new_password)
  return res.json(user)
}
