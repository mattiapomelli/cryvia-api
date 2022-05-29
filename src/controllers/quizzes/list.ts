import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const quizzes = await prisma.quiz.findMany({
    include: {
      categories: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  res.resolve(quizzes)
})
