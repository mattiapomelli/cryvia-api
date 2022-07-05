import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/submissions/:id',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  // Check if submission exists
  const submission = await prisma.quizSubmission.findUnique({
    where: {
      id,
    },
  })

  if (!submission) {
    return res.notFound('Submission to delete not found')
  }

  await prisma.quizSubmission.delete({
    where: {
      id,
    },
  })

  return res.resolve({ message: 'Submission deleted' })
})
