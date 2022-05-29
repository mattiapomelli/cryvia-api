import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/categories',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { name } = req.body

  const category = await prisma.category.create({
    data: {
      name,
    },
  })

  return res.resolve(category)
})
