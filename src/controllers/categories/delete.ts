import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/categories/:id',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  // Delete category
  await prisma.category.delete({
    where: {
      id,
    },
  })

  return res.resolve({ message: 'Category deleted' })
})
