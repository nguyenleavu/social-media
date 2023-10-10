import { BOOKMARK_MESSAGE } from '@/constants/messages'
import { BookmarkReqParams } from '@/models/requests/Bookmarks.request'
import { TokenPayload } from '@/models/requests/users.requests'
import bookmarkService from '@/services/bookmarks.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const bookmarkPostController = async (req: Request<ParamsDictionary, any, BookmarkReqParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const data = await bookmarkService.bookmarkPost(user_id, req.params.post_id)
  return res.json({
    message: BOOKMARK_MESSAGE.BOOKMARK_SUCCESS,
    data
  })
}

export const unbookmarkPostController = async (
  req: Request<ParamsDictionary, any, BookmarkReqParams>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  await bookmarkService.unbookmarkPost(user_id, req.params.post_id)
  return res.json({
    message: BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESS
  })
}
