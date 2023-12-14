import databaseServices from './database.services'
import Hashtag from '@/models/schemas/Hashtag.schema'

class HashtagService {
  async hashtag({ content, limit, page }: { content: string; limit: number; page: number }) {
    const [hashtags, total] = await Promise.all([
      databaseServices.hashtags
        .aggregate<Hashtag>([
          {
            $match: {
              name: {
                $regex: content
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'posts',
              localField: '_id',
              foreignField: 'hashtags',
              as: 'posts'
            }
          },
          {
            $addFields: {
              posts: {
                $size: '$posts'
              }
            }
          }
        ])
        .toArray(),
      databaseServices.hashtags
        .aggregate([
          {
            $match: {
              name: {
                $regex: content
              }
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return { data: hashtags, total: total[0]?.total || 0 }
  }
}

const hashtagService = new HashtagService()

export default hashtagService
