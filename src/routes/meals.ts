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

    const groupedMeals = meals.reduce((acc: any, item) => {
      const date = item.updated_at.split(' ')[0] // ExtraiMeals (parte antes do espaço)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    }, {})

    reply.status(200).send(groupedMeals)
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

  app.put('/meals/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
    })

    const { token } = request.cookies

    const { sub } = app.jwt.decode(token!)
    const { id } = paramsSchema.parse(request.params)
    const { name, isOnDiet, description } = bodySchema.parse(request.body)
    const meal = await knex('meals')
      .where({ id })
      .andWhere({ user_id: sub })
      .first()

    if (!meal) {
      throw new Error('Informacoes invalidas')
    }

    await knex('meals')
      .update({
        name: name || meal.name,
        description: description || meal.description,
        isOnDiet: isOnDiet || meal.isOnDiet,
        updated_at: knex.fn.now(),
      })
      .where({ id })

    return reply.status(201).send('Prato atualizado com sucesso')
  })
}
