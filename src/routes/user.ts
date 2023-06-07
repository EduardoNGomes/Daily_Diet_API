import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function userRouter(app: FastifyInstance) {
  app.post('/users', (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
    })
    const { name } = bodySchema.parse(request.body)

    return reply.status(200).send(name)
  })
}
