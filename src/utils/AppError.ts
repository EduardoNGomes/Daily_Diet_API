export class AppError {
  message: string
  statusCode: number
  error: any

  constructor(message: string, statusCode = 400) {
    this.message = message
    this.statusCode = statusCode
  }
}
