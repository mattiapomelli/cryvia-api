import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/me/submissions',
}

controllers.register(config, async (req, res) => {
  const id = res.getLocals('userId')

  const submissions = await prisma.quizSubmission.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      submittedAt: 'desc',
    },
    select: {
      id: true,
      quiz: true,
      submittedAt: true,
    },
  })

  return res.resolve(submissions)
})
