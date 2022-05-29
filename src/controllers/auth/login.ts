import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/auth/login',
  auth: AuthType.PUBLIC,
}

// Checks if a user with a given address exists and creates it otherwise
controllers.register(config, async (req, res) => {
  const { address } = req.body

  if (!address) {
    return res.unAuthorized('Address is required')
  }

  // Check if a user with the given address already exists
  let user = await prisma.user.findUnique({
    where: {
      address,
    },
    select: {
      id: true,
      address: true,
      username: true,
      createdAt: true,
    },
  })

  if (!user) {
    // If user doesn't exist then create it
    user = await prisma.user.create({
      data: {
        address,
      },
      select: {
        id: true,
        address: true,
        username: true,
        createdAt: true,
      },
    })
  }

  return res.resolve(user)
})
