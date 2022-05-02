import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/:id/submissions',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quizId: id,
    },
    orderBy: {
      submittedAt: 'asc',
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
      submittedAt: true,
    },
  })

  return res.resolve(submissions)
})
