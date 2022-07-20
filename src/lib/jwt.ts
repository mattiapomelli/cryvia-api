import jwt from 'jsonwebtoken'

interface JwtPaylod {
  id: number
  address: string
}

export function verifyJwt(token: string) {
  if (!process.env.JWT_SECRET) {
    console.log('JWT_SECRET envinronment variable must be set')
    throw new Error()
  }

  return jwt.verify(token, process.env.JWT_SECRET) as JwtPaylod
}
