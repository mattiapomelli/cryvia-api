import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const { onlyPast, onlyUpcoming } = req.query

  const quizzes = await prisma.quiz.findMany({
    ...(onlyPast && {
      where: {
        startTime: {
          lt: new Date(),
        },
      },
    }),
    ...(onlyUpcoming && {
      where: {
        startTime: {
          gt: new Date(),
        },
      },
    }),
    include: {
      categories: true,
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  res.resolve(quizzes)
})
