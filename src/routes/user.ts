import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { upload } from '../configs/multer'

export async function userRouter(app: FastifyInstance) {
  app.post(
    '/users',
    { preHandler: upload.single('file') },
    (request, reply) => {
      console.log(request.file)
      const bodySchema = z.object({
        name: z.string(),
      })
      const { name } = bodySchema.parse(request.body)

      return reply.status(200).send(name)
    },
  )
}
