import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/submissions/:id',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

  // Check if user exists
  const submission = await prisma.quizSubmission.findUnique({
    where: {
      id,
    },
  })

  if (!submission) {
    return res.notFound('Submission to delete not found')
  }

  // Delete submission
  const deleteSubmission = prisma.$executeRaw`DELETE FROM quiz_submissions WHERE id=${id};`

  // // Delete submission answers of the questions to delete
  const deleteSubmissionsAnswers = prisma.submissionAnswers.deleteMany({
    where: {
      submissionId: id,
    },
  })

  await prisma.$transaction([deleteSubmissionsAnswers, deleteSubmission])

  return res.resolve({ message: 'Submission deleted' })
})
