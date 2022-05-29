import jwt from 'jsonwebtoken'
import { recoverPersonalSignature } from '@metamask/eth-sig-util'

import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'post',
  path: '/auth/verify',
  isPublic: true,
}

// Verifies the signature of a given address and issues a jwt if successfull
controllers.register(config, async (req, res) => {
  const { signature, address } = req.body

  const [isValid, message] = validateUser.address(address)
  if (!isValid) {
    return res.badRequest({ address: message })
  }

  if (!signature) {
    return res.badRequest({ signature: 'Signature is required' })
  }

  const user = await prisma.user.findUnique({
    where: {
      address,
    },
    select: {
      id: true,
      address: true,
      username: true,
      createdAt: true,
      nonce: true,
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
    const { nonce, ...rest } = user

    // Verify signature
    const recoveredAddress = recoverPersonalSignature({
      data: `Please sign this random nonce: ${nonce}`,
      signature,
    })

    if (recoveredAddress.toLowerCase() !== user.address.toLowerCase()) {
      return res.unAuthorized('Failed to verify signature')
    }

    // Update the nonce to prevent reply attacks
    const newNonce = Math.floor(Math.random() * 10000000)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nonce: newNonce,
      },
    })

    const payload = {
      id: user.id,
      address: user.address,
    }

    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET envinronment variable must be set')
      throw new Error()
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET)

    return res.resolve({ token, user: rest })
  } catch (error) {
    return res.unAuthorized('Failed to verify signature')
  }
})
