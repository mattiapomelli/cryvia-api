import { Answer } from '@prisma/client'

import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/questions',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { text, answers } = req.body

  const quiz = await prisma.question.create({
    data: {
      text,
      answers: {
        create: (answers as Answer[]).map((answer, index) => ({
          ...answer,
          index,
        })),
      },
    },
    include: {
      answers: true,
    },
  })

  return res.resolve(quiz)
})
