import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'delete',
  path: '/users/me',
}

controllers.register(config, async (req, res) => {
  const id = res.getLocals('userId')

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
