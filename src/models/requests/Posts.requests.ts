import { PostAudience, PostType } from '@/constants/enums'
import { Media } from '../Other'

export interface PostReqBody {
  type: PostType
  audience: PostAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}
