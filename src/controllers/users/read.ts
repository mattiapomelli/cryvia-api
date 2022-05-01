import { NextFunction, Request, Response } from 'express'

import prisma from '@lib/prisma'

export default async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = Number(req.params.id)

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    return res.json(user)
  } catch (error) {
    next(error)
  }
}
