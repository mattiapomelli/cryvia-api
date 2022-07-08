import { ethers } from 'ethers'

import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract } from '@lib/contracts'

const config: ControllerConfig = {
  method: 'post',
  path: '/contract/quiz',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { quizId, price } = req.body

  const quizContract = await getQuizContract()
  const tx = await quizContract.createQuiz(
    quizId,
    ethers.utils.parseUnits(price.toString(), 18), // TODO: use actual number of decimals
  )

  await tx.wait()

  return res.resolve({})
})
