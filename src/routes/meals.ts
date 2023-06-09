import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../configs/knex'
import { randomUUID } from 'crypto'
export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
  app.post('/meals', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
    })
    const { token } = request.cookies
    const { sub } = app.jwt.decode(token!)

    const { name, description, isOnDiet } = bodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      user_id: sub,
      name,
      description,
      isOnDiet,
    })

    reply.status(201).send('Prato criado com sucesso')
  })
}
