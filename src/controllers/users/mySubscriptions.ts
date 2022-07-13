import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/me/subscriptions',
}

controllers.register(config, async (req, res) => {
  const id = res.getLocals('userId')

  const subscriptions = await prisma.quizSubscription.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      quiz: {
        startTime: 'desc',
      },
    },
    select: {
      quiz: true,
    },
  })

  return res.resolve(subscriptions)
})
