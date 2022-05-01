import { NextFunction, Request, Response } from 'express'

import prisma from '@lib/prisma'

export default async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = Number(req.params.id)

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    })

    return res.json({})
  } catch (error) {
    next(error)
  }
}
