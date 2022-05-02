import { Response } from 'express'

interface Pagination {
  total: number
  perPage: number
  page: number
}

class WrappedResponse {
  private res: Response

  constructor(res: Response) {
    this.res = res
  }

  resolve(data: unknown, pagination?: Pagination) {
    this.res.status(200).json({
      data: data,
      ...(pagination && { pagination }),
    })
  }

  badRequest(errors: Record<string, string> | string) {
    this.res.status(400).json({ errors })
  }

  unAuthorized(message?: string) {
    this.res.status(401).json({ message })
  }

  forbidden(message?: string) {
    this.res.status(403).json({ message })
  }

  notFound(message?: string) {
    this.res.status(404).json({ message })
  }

  conflict(message?: string) {
    this.res.status(409).json({ message })
  }

  unexpectedError(message?: string) {
    this.res.status(500).json(message ? { message } : {})
  }

  setLocals(key: string, value: any) {
    this.res.locals[key] = value
  }

  getLocals(key: string) {
    return this.res.locals[key]
  }
}

export default WrappedResponse
