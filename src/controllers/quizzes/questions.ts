import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/questions',
  isPublic: true,
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
    return res.notFound('Quiz to suscribe to not found')
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
      question: true,
    },
    orderBy: {
      index: 'asc',
    },
  })

  res.resolve(questions)
})
