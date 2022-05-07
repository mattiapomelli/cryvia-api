import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/categories/:id',
  isPublic: true, // TODO: make it callable only by admin
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  await prisma.category.delete({
    where: {
      id,
    },
  })

  return res.resolve({ message: 'Category deleted' })
})
