import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'put',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  const id = Number(req.params.id)
  const { username } = req.body

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      username,
    },
  })

  return res.resolve(user)
})
