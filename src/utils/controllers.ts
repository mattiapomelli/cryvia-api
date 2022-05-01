import { Express, Request, Response } from 'express'

export interface ControllerConfig {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
}

type Controller = (req: Request, res: Response) => void

class Controllers {
  app: Express | null = null

  init(app: Express) {
    this.app = app
  }

  register(config: ControllerConfig, controller: Controller) {
    if (!this.app) {
      throw Error('App must be initialized before registering a controller')
    }

    this.app[config.method](config.path, controller)
  }
}

const controllers = new Controllers()

export default controllers
