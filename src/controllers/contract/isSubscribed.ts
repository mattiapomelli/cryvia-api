import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/:quizId/subscription',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { address } = req.body
  const { quizId } = req.params

  const quizContract = await getQuizContract()

  const isSubscribed = await quizContract.isSubscribed(quizId, address)

  return res.resolve({ isSubcribed: isSubscribed })
})
