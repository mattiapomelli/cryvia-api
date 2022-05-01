import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users',
}

controllers.register(config, async (req, res) => {
  const users = await prisma.user.findMany()

  res.status(200).json({ data: users })
})
