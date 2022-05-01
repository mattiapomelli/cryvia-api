import { Response } from 'express'

class WrappedResponse {
  private res: Response

  constructor(res: Response) {
    this.res = res
  }

  resolve(payload: unknown) {
    this.res.status(200).json({ data: payload })
  }

  badRequest(payload: Record<string, string> | string) {
    this.res.status(400).json({ error: payload })
  }

  unAuthorized(message: string) {
    this.res.status(401).json({ message })
  }

  forbidden(message: string) {
    this.res.status(403).json({ message })
  }

  notFound(message: string) {
    this.res.status(404).json({ message })
  }

  conflict(message: string) {
    this.res.status(409).json({ message })
  }
}

export default WrappedResponse
