import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/submission-status',
  auth: AuthType.PRIVATE,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const quizId = Number(req.params.id)
  const userId = res.getLocals('userId')

  const submission = await prisma.quizSubmission.findFirst({
    where: {
      quizId,
      userId,
    },
    select: {
      id: true,
      submittedAt: true,
      score: true,
    },
  })

  if (!submission) {
    return res.resolve({
      submitted: false,
    })
  }

  return res.resolve({
    submitted: true,
    submission,
  })
})
