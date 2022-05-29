import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const questions = await prisma.question.findMany({
    include: {
      quizzes: {
        select: {
          quizId: true,
        },
      },
    },
  })

  res.resolve(questions)
})
