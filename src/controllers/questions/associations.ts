import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions/associations',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const associations = await prisma.quizQuestions.findMany()

  res.resolve(associations)
})
