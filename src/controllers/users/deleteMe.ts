import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/users/me',
}

controllers.register(config, async (req, res) => {
  const id = res.getLocals('userId')

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    return res.notFound('User to delete not found')
  }

  // Delete user
  const deleteUser = prisma.$executeRaw`DELETE FROM users WHERE id=${id};`

  // Delete submissions
  const deleteSubmissions = prisma.$executeRaw`DELETE FROM quiz_submissions WHERE userId=(${id});`

  // Get submissions to delete
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      userId: id,
    },
  })

  // Delete submission answers of the submissions to delete
  const submissionsIds = submissions.map((submission) => submission.id)
  const deleteSubmissionsAnswers = prisma.submissionAnswers.deleteMany({
    where: {
      submissionId: {
        in: submissionsIds,
      },
    },
  })

  // Delete subscriptions
  const deleteSubscriptions = prisma.quizSubscription.deleteMany({
    where: {
      userId: id,
    },
  })

  await prisma.$transaction([
    deleteSubscriptions,
    deleteSubmissionsAnswers,
    deleteSubmissions,
    deleteUser,
  ])

  return res.resolve({ message: 'User deleted' })
})
