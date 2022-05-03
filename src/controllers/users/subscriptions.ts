import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/:id/subscriptions',
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const subscriptions = await prisma.quizSubscription.findMany({
    where: {
      userId: id,
    },
    select: {
      quiz: true,
    },
  })

  return res.resolve(subscriptions)
})
