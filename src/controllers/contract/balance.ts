import { ethers } from 'ethers'

import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import { getTokenContract } from '@lib/contracts'

const config: ControllerConfig = {
  method: 'get',
  path: '/contract/balance/:address',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { address } = req.params

  const tokenContract = await getTokenContract()
  const balance = await tokenContract.balanceOf(address)

  return res.resolve({ balance: ethers.utils.formatUnits(balance, 18) })
})
