import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import QuizSocketHandler from 'sockets/quizSocketHandler'

const config: ControllerConfig = {
  method: 'get',
  path: '/sockets/end-current-quiz',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const quizSocketHandler = QuizSocketHandler.getInstance()

  await quizSocketHandler.endCurrentQuiz()
  const info = quizSocketHandler.getInfo()

  res.resolve(info)
})
