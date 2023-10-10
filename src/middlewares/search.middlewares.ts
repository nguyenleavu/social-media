import { MediaTypeQuery, PeopleFollow } from '@/constants/enums'
import { validate } from '@/utils/validation'
import { checkSchema } from 'express-validator'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: 'Content must be string'
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: `Media type must be  image or video`
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)],
          errorMessage: `Media type must be  0 or 1`
        }
      }
    },
    ['query']
  )
)
