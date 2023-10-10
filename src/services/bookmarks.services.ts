import Bookmark from '@/models/schemas/Bookmark.schema'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'

class BookmarkService {
  async bookmarkPost(user_id: string, post_id: string) {
    const data = await databaseServices.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        post_id: new ObjectId(post_id)
      },
      {
        $setOnInsert: new Bookmark({
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

  async unbookmarkPost(user_id: string, post_id: string) {
    const data = await databaseServices.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      post_id: new ObjectId(post_id)
    })
    return data
  }
}

const bookmarkService = new BookmarkService()

export default bookmarkService
