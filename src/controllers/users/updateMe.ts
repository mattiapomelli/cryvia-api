import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'put',
  path: '/users/me',
}

controllers.register(config, async (req, res) => {
  const id = res.getLocals('userId')
  const { username } = req.body

  // Check if user to update exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    return res.notFound('User to update not found')
  }

  const [isValidUsername, usernameMessage] = validateUser.username(username)
  if (!isValidUsername) {
    return res.badRequest({ username: usernameMessage })
  }

  // Check if username is taken
  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (existingUser) {
    return res.forbidden('Username is already taken')
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      username,
    },
    select: {
      id: true,
      address: true,
      username: true,
      createdAt: true,
    },
  })

  return res.resolve(updatedUser)
})
