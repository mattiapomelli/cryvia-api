import { NextFunction, Request, Response } from 'express'

class UsersController {
  public async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ data: 'All users' })
    } catch (error) {
      next(error)
    }
  }
}

const usersController = new UsersController()

export default usersController
