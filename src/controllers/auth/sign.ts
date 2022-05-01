import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/auth/sign/:address',
}

controllers.register(config, async (req, res) => {
  const address = req.params.address

  const user = await prisma.user.findUnique({
    where: {
      address,
    },
  })

  if (!user) {
    return res.notFound('User not found')
  }

  let nonce

  if (user.nonce) {
    // If a nonce exists then use it
    nonce = user.nonce
  } else {
    // Otherwise generate a random nonce to be signed
    nonce = Math.floor(Math.random() * 10000000)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nonce,
      },
    })
  }

  return res.resolve({ message: `Please sign this random nonce: ${nonce}` })
})
