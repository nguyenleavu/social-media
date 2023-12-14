import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { HashtagQuery } from '@/models/requests/Hashtag.request'
import hashtagService from '@/services/hashtag.services'

export const hashTagController = async (req: Request<ParamsDictionary, any, HashtagQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content as string

  const { data, total } = await hashtagService.hashtag({
    limit,
    page,
    content
  })
  return res.json({
    message: 'Get hashtag success',
    data,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
