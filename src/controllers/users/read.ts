import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    return res.json(user)
  } catch (error) {
    console.log(error)
  }
})
