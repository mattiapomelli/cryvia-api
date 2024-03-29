import prisma from '@lib/prisma'
import controllers, { ControllerConfig, AuthType } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/:id/submissions',
  auth: AuthType.PUBLIC,
  // TODO: make only admin? Or only owner?
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      submittedAt: 'desc',
    },
    select: {
      id: true,
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          categories: true,
        },
      },
      submittedAt: true,
      score: true,
    },
  })

  return res.resolve(submissions)
})
