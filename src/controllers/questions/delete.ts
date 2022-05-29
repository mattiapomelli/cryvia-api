import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/questions/:id',
  isPublic: true, // TODO: make it callable only by admin
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

  // Delete question
  const deleteQuestion = prisma.$executeRaw`DELETE FROM questions WHERE id=${id};`

  // Delete quiz-question associations
  const deleteQuizQuestions = prisma.quizQuestions.deleteMany({
    where: {
      questionId: id,
    },
  })

  // Delete answers
  const deleteAnswers = prisma.answer.deleteMany({
    where: {
      questionId: id,
    },
  })

  // Delete submission answers
  const deleteSubmissionAnswers = prisma.submissionAnswers.deleteMany({
    where: {
      questionId: id,
    },
  })

  await prisma.$transaction([
    deleteQuizQuestions,
    deleteAnswers,
    deleteSubmissionAnswers,
    deleteQuestion,
  ])

  return res.resolve({ message: 'Question deleted' })
})
