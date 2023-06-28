import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../configs/knex'
import { randomUUID } from 'crypto'

interface MealsProps {
  id: string
  user_id: string
  name: string
  description: string
  isOnDiet: boolean
  created_at: string
  updated_at: string
}

interface groupedMealsProps {
  data: string
  items: MealsProps[]
}

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
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    })
    const { sub } = request.user

    // eslint-disable-next-line camelcase
    const { name, description, isOnDiet, created_at, updated_at } =
      bodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      user_id: sub,
      name,
      description,
      isOnDiet,
      // eslint-disable-next-line camelcase
      created_at,
      // eslint-disable-next-line camelcase
      updated_at,
    })

    reply.status(201).send('Prato criado com sucesso')
  })

  app.get('/meals', async (request, reply) => {
    const { sub } = request.user

    const meals = await knex('meals')
      .where({ user_id: sub })
      .orderBy('updated_at', 'desc')
      .groupBy('updated_at')

    const seen = new Set()

    const groupedMeals: groupedMealsProps[] = []

    meals.forEach((meal) => {
      const key = `${meal.updated_at.split(' ')[0]}`

      if (!seen.has(key)) {
        groupedMeals.push({ data: key, items: [meal] })
        seen.add(key)
      } else {
        const index = groupedMeals.findIndex((meal) => meal.data === key)
        groupedMeals[index].items.push(meal)
      }
    })

    return reply.status(200).send(groupedMeals)
  })

  app.get('/meals/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { sub } = request.user

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
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      updated_at: z.string(),
    })
    const { sub } = request.user

    const { id } = paramsSchema.parse(request.params)
    // eslint-disable-next-line camelcase
    const { name, isOnDiet, description, updated_at } = bodySchema.parse(
      request.body,
    )
    const meal = await knex('meals')
      .where({ id })
      .andWhere({ user_id: sub })
      .first()

    if (!meal) {
      throw new Error('Informacoes invalidas')
    }

    await knex('meals')
      .update({
        name,
        description,
        isOnDiet,
        // eslint-disable-next-line camelcase
        updated_at: updated_at || knex.fn.now(),
      })
      .where({ id })

    return reply.status(200).send('Prato atualizado com sucesso')
  })

  app.delete('/meals/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { sub } = request.user

    const { id } = paramsSchema.parse(request.params)
    await knex('meals').delete().where({ id }).andWhere({ user_id: sub })

    reply.send('Refeicao excluido com sucesso')
  })
}
