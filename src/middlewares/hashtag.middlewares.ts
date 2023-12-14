import { validate } from '@/utils/validation'
import { checkSchema } from 'express-validator'

export const hashtagValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: 'Content must be string'
        }
      }
    },
    ['query']
  )
)
