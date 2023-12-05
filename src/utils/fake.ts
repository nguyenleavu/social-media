import { PostAudience, PostType, UserVerifyStatus } from '@/constants/enums'
import { PostReqBody } from '@/models/requests/Posts.requests'
import { RegisterReqBody } from '@/models/requests/Users.requests'
import User from '@/models/schemas/User.schema'
import databaseServices from '@/services/database.services'
import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { hasPassword } from './crypto'
import Follower from '@/models/schemas/Follower.schema'
import postsService from '@/services/posts.services'

const PASSWORD = '123456789aA@'
const MY_ID = '65702cd5902ca0f0747f84d5'
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

const medias = [
  {
    url: 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/157a2ba6c979f0a987da6a001.jpg',
    type: 0
  },
  {
    url: 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/aa522d6ff12de0392e479ec00.jpg',
    type: 0
  },
  {
    url: 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/aa522d6ff12de0392e479ec01.jpg',
    type: 0
  },
  {
    url: 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/aa522d6ff12de0392e479ec02.jpg',
    type: 0
  },
  {
    url: 'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/aa522d6ff12de0392e479ec03.jpg',
    type: 0
  }
]

const createRandomPost = () => {
  const number = Math.floor(Math.random() * 5)

  const posts: PostReqBody = {
    type: PostType.Post,
    audience: PostAudience.Everyone,
    content: faker.lorem.paragraph({ min: 20, max: 40 }),
    hashtags: [],
    mentions: [],
    medias: [medias[number]],
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
          _id: user_id,
          avatar:
            'https://social-media-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/16f5ccab09a4d9bc58768b400.jpg',
          post_circle: [user_id],
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

const followMultipleUsers = async (user_id: string, followed_user_ids: ObjectId[]) => {
  await Promise.all(
    followed_user_ids.map((followed_user_id) => {
      databaseServices.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      databaseServices.followers.insertOne(
        new Follower({
          user_id: new ObjectId(followed_user_id),
          followed_user_id: new ObjectId(user_id)
        })
      )
    })
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
  followMultipleUsers(MY_ID, ids)
  insertMultiplePost(ids)
})
