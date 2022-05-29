import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/questions',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateQuiz.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const quizId = Number(req.params.id)
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
  })

  if (!quiz) {
    return res.notFound('Quiz not found')
  }

  // Check if quiz is about to start
  if (quiz.startTime.getTime() > Date.now() - 5000) {
    return res.forbidden('Can only get questions when quiz is about to start')
  }

  const questions = await prisma.quizQuestions.findMany({
    where: {
      quizId,
    },
    select: {
      question: {
        include: {
          answers: {
            orderBy: {
              index: 'asc',
            },
            select: {
              id: true,
              text: true,
              correct: false,
              index: false,
              questionId: false,
            },
          },
        },
      },
    },
    orderBy: {
      index: 'asc',
    },
  })

  res.resolve(questions)
})
