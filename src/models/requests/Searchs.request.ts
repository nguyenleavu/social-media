import { MediaTypeQuery } from '@/constants/enums'

export interface SearchQuery extends PerformanceNavigationTiming {
  content: string
  limit: string
  page: string
  media_type?: MediaTypeQuery
  people_follow?: string
}
