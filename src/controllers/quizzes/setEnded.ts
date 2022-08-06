import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'put',
  path: '/quizzes/:id/ended',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)

  const quiz = await prisma.quiz.update({
    where: {
      id,
    },
    data: {
      ended: true,
    },
  })

  return res.resolve(quiz)
})
