import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/next',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const nextQuiz = await prisma.quiz.findFirst({
    where: {
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      categories: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  res.resolve(nextQuiz)
})
