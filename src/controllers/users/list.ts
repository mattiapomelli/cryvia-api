import { NextFunction, Request, Response } from 'express'

import prisma from '@lib/prisma'

export default async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await prisma.user.findMany()

    res.status(200).json({ data: users })
  } catch (error) {
    next(error)
  }
}
