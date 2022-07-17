import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'
import { ethers } from 'ethers'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/:quizId/owner-balance',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const quizContract = await getQuizContract()
  const ownerBalance = await quizContract.ownerBalance()

  return res.resolve({
    ownerBalance: ethers.utils.formatUnits(ownerBalance, 18),
  })
})
