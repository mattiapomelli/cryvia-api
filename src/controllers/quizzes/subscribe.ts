import { getQuizContract } from '@lib/contracts'
import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import { quizValidators } from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'post',
  path: '/quizzes/:id/subscribe',
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = quizValidators.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const userId = res.getLocals('userId')
  const userAddress = res.getLocals('userAddress')

  // Check if quiz exists
  const quizId = Number(req.params.id)
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
  })

  if (!quiz) {
    return res.notFound('Quiz to suscribe to not found')
  }

  // TODO: check if user is subscribed in the smart contract (so has paid the fee)
  const quizContract = await getQuizContract()
  const isSubscribed = await quizContract.isSubscribed(quizId, userAddress)

  if (!isSubscribed) {
    return res.forbidden(
      "You cannot subscribe to a quiz you haven't paid the fee for",
    )
  }

  // Check if user is already subscribed
  const subscription = await prisma.quizSubscription.findUnique({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  })

  if (subscription) {
    return res.badRequest(`You are already subscribed to quiz ${quizId}`)
  }

  // Subscribe user to quiz
  await prisma.quizSubscription.create({
    data: {
      quizId,
      userId,
    },
  })

  return res.resolve(`Succesfully subscribed to quiz ${quizId}`)
})
