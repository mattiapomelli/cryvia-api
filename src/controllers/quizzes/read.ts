import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateQuiz.id(req.params.id)
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
      questions: {
        orderBy: {
          index: 'asc',
        },
        select: {
          index: false,
          question: {
            include: {
              answers: {
                orderBy: {
                  index: 'asc',
                },
                select: {
                  id: true,
                  text: true,
                  correct: true,
                  index: false,
                  questionId: false,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!quiz) {
    return res.notFound('Quiz not found')
  }

  return res.resolve(quiz)
})
