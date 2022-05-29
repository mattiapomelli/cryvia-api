import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/submissions',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: {
      submittedAt: 'desc',
    },
  })

  res.resolve(submissions)
})
