import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/answers',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const answers = await prisma.answer.findMany()

  res.resolve(answers)
})
