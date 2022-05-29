import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/subscriptions',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const subscriptions = await prisma.quizSubscription.findMany({
    where: {
      quizId: id,
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
    },
  })

  return res.resolve(subscriptions)
})
