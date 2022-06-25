import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'

const config: ControllerConfig = {
  method: 'post',
  path: '/contract/:quizId/winners',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  let { winners } = req.body
  const { quizId } = req.params

  if (!winners) {
    const submissions = await prisma.quizSubmission.findMany({
      where: {
        quizId: Number(quizId),
      },
      orderBy: {
        score: 'desc',
      },
      take: 2, // TODO: replace with number of winners of the quiz
      include: {
        user: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    })

    winners = submissions.map((s) => s.user.address)
  }

  console.log('>>> Winners: ', winners)

  // Save winners on the blockchain
  const quizContract = await getQuizContract()
  await quizContract.setWinners(1, winners) // TODO: replace with quiz from request body

  return res.resolve({})
})
