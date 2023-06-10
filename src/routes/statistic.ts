import { FastifyInstance } from 'fastify'
import { knex } from '../configs/knex'

export async function statisticRoute(app: FastifyInstance) {
  app.get(
    '/statistic',
    { preHandler: (request) => request.jwtVerify() },
    async (request, reply) => {
      const { token } = request.cookies
      const { sub } = app.jwt.decode(token!)

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

      const userStatistic = {
        allMeals: meals.length,
        mealsOnDiet: mealsOnDiet.length,
        mealsOffDiet: mealsOffDiet.length,
        dietSequence,
        percentageOnDiet: ((mealsOnDiet.length * 100) / meals.length).toFixed(
          2,
        ),
        percentageOffDiet: ((mealsOffDiet.length * 100) / meals.length).toFixed(
          2,
        ),
      }

      return reply.send(userStatistic)
    },
  )
}
