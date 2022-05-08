import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      address: true,
      username: true,
      createdAt: true,
    },
  })

  res.resolve(users)
})
