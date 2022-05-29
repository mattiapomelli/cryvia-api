import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions',
  auth: AuthType.PUBLIC,
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
