import jwt from 'jsonwebtoken'

import { Middleware } from 'types'

interface JwtPaylod {
  id: string
  address: string
}

const authMiddleware: Middleware = async (req, res, next) => {
  if (!req.headers['x-auth-token']) {
    return res.unAuthorized('No token was provided')
  }

  // Get jwt from header
  const token = req.headers['x-auth-token'].toString()

  if (!process.env.JWT_SECRET) {
    console.log('JWT_SECRET envinronment variable must be set')
    throw new Error()
  }

  try {
    // Verify jwt
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPaylod

    res.setLocals('userId', payload.id)
    res.setLocals('userAddress', payload.address)

    next()
  } catch (error) {
    return res.unAuthorized('Failed to verify token')
  }
}

export default authMiddleware
