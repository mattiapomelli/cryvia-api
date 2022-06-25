import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'
import { ethers } from 'ethers'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/:quizId/fund',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { quizId } = req.params

  const quizContract = await getQuizContract()
  const fund = await quizContract.quizFund(quizId)

  return res.resolve({ fund: ethers.utils.formatUnits(fund, 18) })
})
