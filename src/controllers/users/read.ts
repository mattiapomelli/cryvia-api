import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      address: true,
      username: true,
      createdAt: true,
    },
  })

  if (!user) {
    return res.notFound('User not found')
  }

  return res.resolve(user)
})
