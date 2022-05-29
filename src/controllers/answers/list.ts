import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/answers',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const answers = await prisma.answer.findMany()

  res.resolve(answers)
})
