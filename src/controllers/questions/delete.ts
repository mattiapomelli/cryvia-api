import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/questions/:id',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  // Check if question exists
  const question = await prisma.question.findUnique({
    where: {
      id,
    },
  })

  if (!question) {
    return res.notFound('Question to delete not found')
  }

  await prisma.question.delete({
    where: {
      id,
    },
  })

  return res.resolve({ message: 'Question deleted' })
})
