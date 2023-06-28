import { FastifyInstance } from 'fastify'
import { knex } from '../configs/knex'

export async function statisticRoute(app: FastifyInstance) {
  app.get(
    '/statistic',
    { preHandler: (request) => request.jwtVerify() },
    async (request, reply) => {
      const { sub } = request.user

      const meals = await knex('meals').where({ user_id: sub })

      const mealsOnDiet = meals.filter((meal) => meal.isOnDiet && meal)
      const mealsOffDiet = meals.filter((meal) => !meal.isOnDiet && meal)

      let dietSequence = 0

      meals.forEach((meal) => {
        if (meal.isOnDiet) {
          dietSequence++
        } else {
          dietSequence = 0
        }
      })

      const percentageOnDiet = (
        (mealsOnDiet.length * 100) /
        meals.length
      ).toFixed(2)

      const percentageOffDiet = (
        (mealsOffDiet.length * 100) /
        meals.length
      ).toFixed(2)

      const userStatistic = {
        allMeals: meals.length,
        mealsOnDiet: mealsOnDiet.length,
        mealsOffDiet: mealsOffDiet.length,
        dietSequence,
        percentageOnDiet: Number(percentageOnDiet) > 0 ? percentageOnDiet : 0,
        percentageOffDiet:
          Number(percentageOffDiet) > 0 ? percentageOffDiet : 0,
      }

      return reply.send(userStatistic)
    },
  )
}
