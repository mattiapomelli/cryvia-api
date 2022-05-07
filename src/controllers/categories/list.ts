import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/categories',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const categories = await prisma.category.findMany()

  res.resolve(categories)
})
