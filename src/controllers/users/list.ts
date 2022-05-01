import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/users',
}

controllers.register(config, async (req, res) => {
  try {
    const users = await prisma.user.findMany()

    res.status(200).json({ data: users })
  } catch (error) {
    console.log(error)
  }
})
