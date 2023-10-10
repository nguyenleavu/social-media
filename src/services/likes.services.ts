import Like from '@/models/schemas/Like.schema'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'

class LikeService {
  async likePost(user_id: string, post_id: string) {
    const data = await databaseServices.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        post_id: new ObjectId(post_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          post_id: new ObjectId(post_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return data
  }

  async unlikePost(user_id: string, post_id: string) {
    const data = await databaseServices.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id)
    })
    return data
  }
}

const likeService = new LikeService()

export default likeService
