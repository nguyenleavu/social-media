import { MediaTypeQuery } from '@/constants/enums'

export interface SearchQuery extends PerformanceNavigationTiming {
  content: string
  limit: string
  page: string
  media_type?: MediaTypeQuery
  people_follow?: string
}

export interface SearchUserQuery extends PerformanceNavigationTiming {
  username: string
  limit: string
  page: string
}
