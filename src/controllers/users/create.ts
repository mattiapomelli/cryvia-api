import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'
import validateUser from '@validation/users'

const config: ControllerConfig = {
  method: 'post',
  path: '/users',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  const { address } = req.body

  const [isValid, message] = validateUser.address(address)

  if (!isValid) {
    return res.badRequest({ address: message })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      address,
    },
  })

  if (existingUser) {
    return res.forbidden('A user with this address already exists')
  }

  const user = await prisma.user.create({
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

  return res.resolve(user)
})
