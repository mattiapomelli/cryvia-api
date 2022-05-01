import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/users',
}

controllers.register(config, async (req, res) => {
  const { username, address } = req.body

  if (!username) {
    return res.badRequest('Username is required')
  }

  if (!address) {
    return res.badRequest('Address is required')
  }

  const user = await prisma.user.create({
    data: {
      username,
      address,
    },
  })

  return res.resolve(user)
})
