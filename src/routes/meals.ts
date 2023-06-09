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
      isOnDiet: z.boolean(),
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

  app.get('/meals', async (request, reply) => {
    const { token } = request.cookies
    const { sub } = app.jwt.decode(token!)

    const meals = await knex('meals')
      .where({ user_id: sub })
      .orderBy('updated_at', 'asc')
      .groupBy('updated_at')

    const groupedData = meals.reduce((acc: any, item) => {
      const date = item.updated_at.split(' ')[0] // Extrai a data (parte antes do espaço)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    }, {})

    reply.status(200).send(groupedData)
  })

  app.get('/meals/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const { token } = request.cookies
    const { sub } = app.jwt.decode(token!)

    const meal = await knex('meals')
      .where({ user_id: sub })
      .andWhere({ id })
      .first()

    reply.status(200).send(meal)
  })
}
