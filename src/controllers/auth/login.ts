import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import { recoverPersonalSignature } from '@metamask/eth-sig-util'

const config: ControllerConfig = {
  method: 'post',
  path: '/auth/login',
}

controllers.register(config, async (req, res) => {
  const { signature, address } = req.body

  const user = await prisma.user.findUnique({
    where: {
      address,
    },
  })

  if (!user) {
    return res.notFound('User not found')
  }

  // Check if nonce exists
  if (!user.nonce) {
    return res.unAuthorized(
      'You have to request a nonce to sign before logging in',
    )
  }

  try {
    // Verify signature
    const recoveredAddress = recoverPersonalSignature({
      data: `Please sign this random nonce: ${user.nonce}`,
      signature,
    })

    if (recoveredAddress.toLowerCase() !== user.address.toLowerCase()) {
      return res.unAuthorized('Failed to verify signature')
    }

    // Update the nonce to prevent reply attacks
    const nonce = Math.floor(Math.random() * 10000000)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nonce,
      },
    })

    return res.resolve({ data: 'Login succesfull' })
  } catch (error) {
    return res.unAuthorized('Failed to verify signature')
  }
})
