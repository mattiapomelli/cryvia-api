import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/next-or-last',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const nextQuiz = await prisma.quiz.findFirst({
    include: {
      categories: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  res.resolve(nextQuiz)
})
