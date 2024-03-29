import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { quizValidators } from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'get',
  path: '/submissions/:id',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = quizValidators.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const submission = await prisma.quizSubmission.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      quiz: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
      submittedAt: true,
      score: true,
      answers: {
        orderBy: {
          index: 'asc',
        },
        select: {
          question: {
            include: {
              answers: {
                select: {
                  id: true,
                  text: true,
                  correct: true,
                },
                orderBy: {
                  index: 'asc',
                },
              },
            },
          },
          answerId: true,
          time: true,
        },
      },
    },
  })

  if (!submission) {
    return res.notFound('Submission not found')
  }

  return res.resolve(submission)
})
