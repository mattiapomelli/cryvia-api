import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/submissions/:id',
  isPublic: true, // TODO: make it callable only by admin
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)

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
