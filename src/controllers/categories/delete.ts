import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/categories/:id',
  isPublic: true, // TODO: make it callable only by admin
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  // Delete category
  const deleteCategory = prisma.category.delete({
    where: {
      id,
    },
  })

  // Delete quiz categories
  const deleteQuizCategories = prisma.$executeRaw`DELETE FROM _quiz_categories WHERE A=${id};`

  await prisma.$transaction([deleteQuizCategories, deleteCategory])

  return res.resolve({ message: 'Category deleted' })
})
