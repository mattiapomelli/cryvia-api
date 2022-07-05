import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'delete',
  path: '/quizzes/:id',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)

  // Check if quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: {
      id,
    },
    include: {
      questions: true,
    },
  })

  if (!quiz) {
    return res.notFound('Quiz to delete not found')
  }

  const deleteQuiz = prisma.quiz.delete({
    where: {
      id,
    },
  })

  // Get questions of the quiz to delete that are used also in other quizzes
  const questionIds = quiz.questions.map((q) => q.questionId)
  const questionsStillUsed = await prisma.quizQuestions.findMany({
    where: {
      questionId: {
        in: questionIds,
      },
      quizId: {
        not: id,
      },
    },
    select: {
      questionId: true,
    },
  })

  // Get questions that are not used anymore in any quiz
  const questionsStillUsedIds = questionsStillUsed.map((q) => q.questionId)
  const questionsToDeleteIds = questionIds.filter(
    (q) => !questionsStillUsedIds.includes(q),
  )

  const deleteQuestions = prisma.question.deleteMany({
    where: {
      id: {
        in: questionsToDeleteIds,
      },
    },
  })

  // TODO: delete resources that are not used anymore in any quiz?

  await prisma.$transaction([deleteQuestions, deleteQuiz])

  return res.resolve({ message: 'Quiz deleted' })
})
