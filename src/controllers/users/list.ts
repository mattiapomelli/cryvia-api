import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users',
  auth: AuthType.PUBLIC,
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
