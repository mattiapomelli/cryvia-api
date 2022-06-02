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

  // Check it user is already subscribed
  const subscription = await prisma.quizSubscription.findUnique({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  })

  if (subscription) {
    return res.badRequest(`You are already suscribed to quiz ${quizId}`)
  }

  // Subscribe user to quiz
  await prisma.quizSubscription.create({
    data: {
      quizId,
      userId,
    },
  })

  return res.resolve(`Succesfully unsuscribed to quiz ${quizId}`)
})
