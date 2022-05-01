import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'post',
  path: '/users',
}

controllers.register(config, async (req, res) => {
  try {
    const { username, address } = req.body

    if (!username) {
      return res.status(400).send({ message: 'Username is required' })
    }

    if (!address) {
      return res.status(400).send({ message: 'Address is required' })
    }

    const user = await prisma.user.create({
      data: {
        username,
        address,
      },
    })

    return res.json(user)
  } catch (error) {
    console.log(error)
  }
})
