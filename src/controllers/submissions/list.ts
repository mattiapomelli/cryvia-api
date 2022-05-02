import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/submissions',
  isPublic: true, // TODO: make it callable only by admin?
}

controllers.register(config, async (req, res) => {
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: {
      submittedAt: 'desc',
    },
  })

  res.resolve(submissions)
})
