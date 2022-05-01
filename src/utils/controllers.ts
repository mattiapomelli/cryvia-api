import { Express, NextFunction, Request, Response } from 'express'

import WrappedResponse from './wrappedResponse'
import authMiddleware from '@middlewares/auth'
import { Controller, Middleware } from 'types'

export interface ControllerConfig {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  isPublic?: boolean
}

class Controllers {
  app: Express | null = null

  init(app: Express) {
    this.app = app
  }

  wrapController(controller: Controller) {
    return async (req: Request, res: Response) => {
      const wrappedRes = new WrappedResponse(res)
      try {
        await controller(req, wrappedRes)
      } catch (error) {
        console.log(error)
        return wrappedRes.unexpectedError('Something went wrong')
      }
    }
  }

  wrapMiddleware(middleware: Middleware) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const wrappedRes = new WrappedResponse(res)
      try {
        await middleware(req, wrappedRes, next)
      } catch (error) {
        console.log(error)
        return wrappedRes.unexpectedError('Something went wrong')
      }
    }
  }

  register(config: ControllerConfig, controller: Controller) {
    if (!this.app) {
      throw Error('App must be initialized before registering a controller')
    }

    const { method, path, isPublic = false } = config

    if (isPublic) {
      this.app[method](path, this.wrapController(controller))
    } else {
      this.app[method](
        path,
        this.wrapMiddleware(authMiddleware),
        this.wrapController(controller),
      )
    }
  }
}

const controllers = new Controllers()

export default controllers
