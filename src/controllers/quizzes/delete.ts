import prisma from '@lib/prisma'
import { Prisma } from '@prisma/client'
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

  // Delete quiz
  const deleteQuiz = prisma.$executeRaw`DELETE FROM quizzes WHERE id=${id};`

  // Delete quiz-question associations
  const deleteQuizQuestions = prisma.quizQuestions.deleteMany({
    where: {
      quizId: id,
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

  // Delete questions that are not used anymore in any quiz
  const deleteQuestions = prisma.$executeRaw`DELETE FROM questions WHERE id IN (${Prisma.join(
    questionsToDeleteIds,
  )});`

  // Delete answers
  const deleteAnswers = prisma.answer.deleteMany({
    where: {
      questionId: {
        in: questionsToDeleteIds,
      },
    },
  })

  // Delete submissions
  const deleteSubmissions = prisma.$executeRaw`DELETE FROM quiz_submissions WHERE quizId=(${id});`

  // Delete submission answers of the questions to delete
  const deleteSubmissionsAnswers = prisma.submissionAnswers.deleteMany({
    where: {
      questionId: {
        in: questionsToDeleteIds,
      },
    },
  })

  // Delete subscriptions
  const deleteSubscriptions = prisma.quizSubscription.deleteMany({
    where: {
      quizId: id,
    },
  })

  // Delete quiz categories
  const deleteQuizCategories = prisma.$executeRaw`DELETE FROM _quiz_categories WHERE B=${id};`

  // Delete quiz resources
  const deleteQuizResources = prisma.$executeRaw`DELETE FROM _quiz_resources WHERE B=${id};`

  // TODO: delete resources that are not used anymore in any quiz?

  await prisma.$transaction([
    deleteQuizResources,
    deleteQuizCategories,
    deleteSubscriptions,
    deleteSubmissionsAnswers,
    deleteSubmissions,
    deleteQuizQuestions,
    deleteQuestions,
    deleteAnswers,
    deleteQuiz,
  ])

  return res.resolve({ message: 'Quiz deleted' })
})
