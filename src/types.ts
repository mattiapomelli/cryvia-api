import { NextFunction, Request } from 'express'

import WrappedResponse from '@utils/wrappedResponse'

export type Controller = (req: Request, res: WrappedResponse) => Promise<void>

export type Middleware = (
  req: Request,
  res: WrappedResponse,
  next: NextFunction,
) => Promise<void>

export type Validation = {
  [key: string]: (value?: string) => [boolean, string]
}
