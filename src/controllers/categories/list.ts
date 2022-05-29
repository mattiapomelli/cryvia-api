import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/categories',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const categories = await prisma.category.findMany()

  res.resolve(categories)
})
