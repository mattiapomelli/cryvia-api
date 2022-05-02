import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const quizzes = await prisma.quiz.findMany()

  res.resolve(quizzes)
})
