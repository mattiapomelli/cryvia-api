import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'delete',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  const [isValid, message] = validateUser.id(req.params.id)
  if (!isValid) {
    return res.badRequest({ id: message })
  }

  const id = Number(req.params.id)

  // Check if user to delete exists
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    return res.notFound('User to delete not found')
  }

  // Delete user
  await prisma.user.delete({
    where: {
      id,
    },
  })

  return res.resolve({ message: 'User deleted' })
})
