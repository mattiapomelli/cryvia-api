import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const NUMBER_OF_WINNERS = 3

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/winners',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const quizId = Number(req.params.id)
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quizId,
    },
    orderBy: {
      score: 'desc',
    },
    take: NUMBER_OF_WINNERS, // TODO: replace with number of winners of the quiz
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
      submittedAt: true,
      score: true,
    },
  })

  return res.resolve(submissions)
})
