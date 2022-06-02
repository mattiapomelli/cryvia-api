import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { quizValidators } from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = quizValidators.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const quiz = await prisma.quiz.findUnique({
    where: {
      id,
    },
    include: {
      categories: true,
    },
  })

  if (!quiz) {
    return res.notFound('Quiz not found')
  }

  return res.resolve(quiz)
})
