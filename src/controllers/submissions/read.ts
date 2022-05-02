import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/submissions/:id',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateQuiz.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const submission = await prisma.quizSubmission.findUnique({
    where: {
      id,
    },
    select: {
      quiz: true,
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
      submittedAt: true,
      answers: {
        orderBy: {
          index: 'asc',
        },
        select: {
          question: true,
          answer: {
            select: {
              id: true,
              text: true,
              correct: true,
            },
          },
        },
      },
    },
  })

  if (!submission) {
    return res.notFound('Submission not found')
  }

  return res.resolve(submission)
})
