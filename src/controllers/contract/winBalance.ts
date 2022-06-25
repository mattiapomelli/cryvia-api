import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'
import { ethers } from 'ethers'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/:quizId/win-balance/:address',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { quizId, address } = req.params

  const quizContract = await getQuizContract()
  const winBalance = await quizContract.winBalance(quizId, address)

  return res.resolve({ winBalance: ethers.utils.formatUnits(winBalance, 18) })
})
