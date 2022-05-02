import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'delete',
  path: '/quizzes/:id',
  isPublic: true, // TODO: make it callable only by admin
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

  // Get ids of quiz's questions
  const questionIds = quiz.questions.map((q) => q.questionId)

  // Get questions of the quiz that are used also in other quizzes
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

  const questionsStillUsedIds = questionsStillUsed.map((q) => q.questionId)

  // Get questions that are not used anymore in any quiz
  const questionsToDeleteIds = questionIds.filter(
    (q) => !questionsStillUsedIds.includes(q),
  )

  // Delete question assignations of quiz to delete
  const deleteQuizQuestions = prisma.quizQuestions.deleteMany({
    where: {
      quizId: id,
    },
  })

  // Delete quiz
  const deleteQuiz = prisma.quiz.delete({
    where: {
      id,
    },
  })

  // Delete questions that are not used anymore in any quiz
  const deleteQuestions = prisma.question.deleteMany({
    where: {
      id: {
        in: questionsToDeleteIds,
      },
    },
  })

  // Delete quiz submissions
  const deleteSubmissions = prisma.quizSubmission.deleteMany({
    where: {
      quizId: id,
    },
  })

  // Delete submission answers of the questions to delete
  const deleteSubmissionsAnswers = prisma.submissionAnswers.deleteMany({
    where: {
      questionId: {
        in: questionsToDeleteIds,
      },
    },
  })

  await prisma.$transaction([
    deleteSubmissionsAnswers,
    deleteSubmissions,
    deleteQuizQuestions,
    deleteQuiz,
    deleteQuestions,
  ])

  return res.resolve({ message: 'Quiz deleted' })
})
