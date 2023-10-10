import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type FilterKeys<Type> = Array<keyof Type>

export const filterMiddleware =
  <Type>(filterKeys: FilterKeys<Type>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
