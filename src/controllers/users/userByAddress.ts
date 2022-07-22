import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/address/:address',
  auth: AuthType.PUBLIC
}

controllers.register(config, async (req, res) => {
  const address = req.params.address;
  const user = await prisma.user.findUnique({
    where: {
      address,
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
