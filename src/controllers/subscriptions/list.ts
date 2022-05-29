import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/subscriptions',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const subscriptions = await prisma.quizSubscription.findMany()

  res.resolve(subscriptions)
})
