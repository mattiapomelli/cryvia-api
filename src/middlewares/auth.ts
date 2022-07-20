import { verifyJwt } from '@lib/jwt'

import { Middleware } from 'types'

const authMiddleware: Middleware = async (req, res, next) => {
  if (!req.headers['x-auth-token']) {
    return res.unAuthorized('No token was provided')
  }

  // Get jwt from header
  const token = req.headers['x-auth-token'].toString()

  try {
    // Verify jwt
    const payload = verifyJwt(token)

    // TODO: Check if id corresponds to an existing user?

    res.setLocals('userId', payload.id)
    res.setLocals('userAddress', payload.address)

    next()
  } catch (error) {
    return res.unAuthorized('Failed to verify token')
  }
}

export default authMiddleware
