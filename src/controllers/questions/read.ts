import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/questions/:id',
  isPublic: true,
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
