import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { SearchQuery } from '@/models/requests/Searchs.request'
import searchService from '@/services/searchs.services'
import { MediaTypeQuery, PeopleFollow } from '@/constants/enums'

export const searchController = async (req: Request<ParamsDictionary, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content as string
  const user_id = req.decode_authorization?.user_id as string
  const media_type = req.query.media_type as MediaTypeQuery
  const people_follow = req.query.people_follow as PeopleFollow
  const { data, total } = await searchService.search({
    limit,
    page,
    content,
    media_type,
    people_follow,
    user_id
  })
  return res.json({
    message: 'Oke',
    data,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
