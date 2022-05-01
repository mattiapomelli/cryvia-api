import { NextFunction, Request, Response } from 'express'

import prisma from '@lib/prisma'

export default async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = Number(req.params.id)

  try {
    const { username } = req.body

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        username,
      },
    })

    return res.json(user)
  } catch (error) {
    next(error)
  }
}
