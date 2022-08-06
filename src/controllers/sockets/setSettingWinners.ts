import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import QuizSocketHandler from 'sockets/quizSocketHandler'

const config: ControllerConfig = {
  method: 'get',
  path: '/sockets/set-setting-winners',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { value } = req.body
  const quizSocketHandler = QuizSocketHandler.getInstance()

  await quizSocketHandler.setSettingWinners(value)
  const info = quizSocketHandler.getInfo()

  res.resolve(info)
})
