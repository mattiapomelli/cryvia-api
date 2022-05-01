import express from 'express'

import getAllUsersController from '@controllers/users/list'
import getUserByIdController from '@controllers/users/read'
import createUserController from '@controllers/users/create'
import updateUserController from '@controllers/users/update'
import deleteUserController from '@controllers/users/delete'

const usersRouter = express.Router()

usersRouter.get('/', getAllUsersController)

usersRouter.get('/:id', getUserByIdController)

usersRouter.post('/', createUserController)

usersRouter.put('/:id', updateUserController)

usersRouter.delete('/:id', deleteUserController)

export default usersRouter
