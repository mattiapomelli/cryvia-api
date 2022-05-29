import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions/associations',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const associations = await prisma.quizQuestions.findMany()

  res.resolve(associations)
})
