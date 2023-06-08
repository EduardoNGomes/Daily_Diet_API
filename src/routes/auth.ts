import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../configs/knex'
import { compare } from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await knex('users').where({ email }).first()

    const validPassword = await compare(password, user!.password)

    if (!validPassword) {
      throw new Error('Senha invalida')
    }

    const token = app.jwt.sign(
      { name: user?.name, avatarUrl: user?.avatarUrl },
      { sub: user?.id, expiresIn: '10 days' },
    )

    return reply.setCookie('token', token).send('Cookie send')
  })
}
