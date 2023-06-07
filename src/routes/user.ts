import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { upload } from '../configs/multer'

export async function userRouter(app: FastifyInstance) {
  app.post(
    '/users',
    { preHandler: upload.single('file') },
    (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })
      const { name } = bodySchema.parse(request.body)
      const image = request.file

      return reply.send(name)
    },
  )
  app.get('/users/avatar/:avatarUrl', (request, reply) => {
    const paramsSchema = z.object({
      avatarUrl: z.string(),
    })
    const { avatarUrl } = paramsSchema.parse(request.params)

    return reply.sendFile(avatarUrl)
  })
}
