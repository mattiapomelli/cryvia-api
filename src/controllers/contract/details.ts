import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'
import { ethers } from 'ethers'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/:quizId/details',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const quizId = Number(req.params.quizId)

  // Save winners on the blockchain
  const quizContract = await getQuizContract()

  const fund = await quizContract.quizFund(quizId)
  const price = await quizContract.quizPrice(quizId)

  return res.resolve({
    fund: ethers.utils.formatUnits(fund, 18),
    price: ethers.utils.formatUnits(price, 18),
  })
})
