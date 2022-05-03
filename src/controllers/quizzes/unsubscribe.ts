import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

const config: ControllerConfig = {
  method: 'post',
  path: '/quizzes/:id/unsubscribe',
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateQuiz.id(req.params.id)
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
    return res.notFound('Quiz to unsuscribe from not found')
  }

  // Check it user is already not subscribed
  const subscription = await prisma.quizSubscription.findUnique({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  })

  if (!subscription) {
    return res.badRequest(`You are already not suscribed to quiz ${quizId}`)
  }

  // Unsubscribe user from quiz
  await prisma.quizSubscription.delete({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  })

  return res.resolve(`Succesfully unsuscribed from quiz ${quizId}`)
})
