import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'

const config: ControllerConfig = {
  method: 'post',
  path: '/quizzes/:id/winners',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const quizId = Number(req.params.id)

  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quizId,
    },
    orderBy: {
      score: 'desc',
    },
    take: 3, // TODO: replace with number of winners of the quiz
    include: {
      user: {
        select: {
          id: true,
          address: true,
        },
      },
    },
  })

  const winners = submissions.map((s) => s.user.address)

  // Save winners on the blockchain
  const quizContract = await getQuizContract()
  await quizContract.setWinners(quizId, winners)

  return res.resolve({})
})
