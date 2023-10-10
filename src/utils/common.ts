import HTTP_STATUS from '@/constants/httpStatus'
import { USER_MESSAGES } from '@/constants/messages'
import { ErrorWithStatus } from '@/models/Errors'
import { Request } from 'express'
import { capitalize, isEmpty } from 'lodash'
import { verifyToken } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (accessToken: string, req?: Request) => {
  if (isEmpty(accessToken)) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZE
    })
  }
  try {
    const decode_authorization = await verifyToken({
      token: accessToken,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      req.decode_authorization = decode_authorization
      return true
    }

    return decode_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZE
    })
  }
  return true
}
