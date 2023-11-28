import 'express'
import { TokenPayload } from '@/models/requests/Users.requests'
import Post from './models/schemas/Post.schema'
import User from './models/schemas/User.schema'

declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
    post?: Post
  }
}
