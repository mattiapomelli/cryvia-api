import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions/:id',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  const question = await prisma.question.findUnique({
    where: {
      id,
    },
    include: {
      answers: true,
    },
  })

  if (!question) {
    return res.notFound('Question not found')
  }

  return res.resolve(question)
})
