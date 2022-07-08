import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getQuizContract, getSigner, getTokenContract } from '@lib/contracts'
import { privateKeys } from 'constants/keys'

const config: ControllerConfig = {
  method: 'post',
  path: '/contract/:quizId/subscribe',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { addresses } = req.body
  const { quizId } = req.params

  for (const address of addresses) {
    const privateKey = privateKeys[address.toLowerCase()]
    const signer = getSigner(privateKey)

    const quizContract = await getQuizContract(signer)
    const tokenContract = await getTokenContract(signer)

    const price = await quizContract.quizPrice(quizId)

    const approveTx = await tokenContract.approve(quizContract.address, price)
    await approveTx.wait()

    const subscribeTx = await quizContract.subscribe(quizId)
    await subscribeTx.wait()
  }

  return res.resolve(`Succesfully subscribed ${addresses} to quiz ${quizId}`)
})
