import { PostAudience, PostType, UserVerifyStatus } from '@/constants/enums'
import { PostReqBody } from '@/models/requests/Posts.requests'
import { RegisterReqBody } from '@/models/requests/users.requests'
import User from '@/models/schemas/User.schema'
import databaseServices from '@/services/database.services'
import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { hasPassword } from './crypto'
import Follower from '@/models/schemas/Follower.schema'
import postsService from '@/services/posts.services'

const PASSWORD = '123456789aA@'
const MY_ID = new ObjectId('651680e0f348fda0b9288712')
const USER_COUNT = 1000

const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

const createRandomPost = () => {
  const posts: PostReqBody = {
    type: PostType.Post,
    audience: PostAudience.Everyone,
    content: faker.lorem.paragraph({ min: 20, max: 160 }),
    hashtags: [],
    mentions: [],
    medias: [],
    parent_id: null
  }
  return posts
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, { count: USER_COUNT })

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseServices.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: hasPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      databaseServices.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    )
  )
}

const insertMultiplePost = async (ids: ObjectId[]) => {
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        postsService.createPost(id.toString(), createRandomPost()),
        postsService.createPost(id.toString(), createRandomPost())
      ])
      count += 2
      console.log(`Create ${count} posts`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MY_ID), ids)
  insertMultiplePost(ids)
})
