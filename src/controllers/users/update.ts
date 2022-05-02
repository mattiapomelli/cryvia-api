import validator from 'validator'

import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'put',
  path: '/users/:id',
}

controllers.register(config, async (req, res) => {
  if (!validator.isNumeric(req.params.id)) {
    return res.badRequest({ id: 'Id must be numeric' })
  }

  const id = Number(req.params.id)
  const { username } = req.body

  if (!validator.isLength(username, { min: 3, max: 24 })) {
    return res.badRequest({
      username: 'Username must be between 3 and 24 characters long',
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (existingUser) {
    return res.forbidden('Username is already taken')
  }

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
