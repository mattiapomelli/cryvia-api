import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'put',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)
  const { username } = req.body

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

  // Check if user to update exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    return res.notFound('User to update not found')
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      username,
    },
  })

  return res.resolve(updatedUser)
})
