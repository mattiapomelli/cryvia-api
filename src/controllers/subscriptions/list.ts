import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/subscriptions',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const subscriptions = await prisma.quizSubscription.findMany()

  res.resolve(subscriptions)
})
