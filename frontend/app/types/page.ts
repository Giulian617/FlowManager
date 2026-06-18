export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string[]
  search?: string
  [key: string]: string | number | string[] | undefined
}
