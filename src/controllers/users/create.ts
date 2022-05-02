import { isAddress } from '@ethersproject/address'

import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/users',
  isPublic: true,
}

controllers.register(config, async (req, res) => {
  const { address } = req.body

  if (!address) {
    return res.badRequest({ address: 'Address is required' })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      address,
    },
  })

  if (existingUser) {
    return res.forbidden('A user with this address already exists')
  }

  if (!isAddress(address)) {
    return res.badRequest({ address: 'Address is not valid' })
  }

  const user = await prisma.user.create({
    data: {
      address,
    },
  })

  return res.resolve(user)
})
