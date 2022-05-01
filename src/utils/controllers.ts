import { Express, Request, Response } from 'express'
import WrappedResponse from './wrappedResponse'

export interface ControllerConfig {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
}

type Controller = (req: Request, res: WrappedResponse) => void

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
        wrappedRes.unexpectedError('Something went wrong')
      }
    }
  }

  register(config: ControllerConfig, controller: Controller) {
    if (!this.app) {
      throw Error('App must be initialized before registering a controller')
    }

    this.app[config.method](config.path, this.wrapController(controller))
  }
}

const controllers = new Controllers()

export default controllers
