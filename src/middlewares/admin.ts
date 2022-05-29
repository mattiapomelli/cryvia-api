import { Middleware } from 'types'

const amdinMiddleware: Middleware = async (req, res, next) => {
  if (!req.headers['x-admin-token']) {
    return res.unAuthorized('No token was provided')
  }

  const token = req.headers['x-admin-token'].toString()

  if (!process.env.X_ADMIN_TOKEN) {
    console.log('X_ADMIN_TOKEN envinronment variable must be set')
    throw new Error()
  }

  if (token === process.env.X_ADMIN_TOKEN) return next()

  return res.unAuthorized('Token not valid')
}

export default amdinMiddleware
