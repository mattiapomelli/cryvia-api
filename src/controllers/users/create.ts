import { NextFunction, Request, Response } from 'express'

import prisma from '@lib/prisma'

export default async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, address } = req.body

    if (!username) {
      return res.status(400).send({ message: 'Username is required' })
    }

    if (!address) {
      return res.status(400).send({ message: 'Address is required' })
    }

    const user = await prisma.user.create({
      data: {
        username,
        address,
      },
    })

    return res.json(user)
  } catch (error) {
    next(error)
  }
}
