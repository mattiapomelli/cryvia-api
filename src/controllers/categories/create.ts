import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/categories',
  isPublic: true, // TODO: make it callable only by admin
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
