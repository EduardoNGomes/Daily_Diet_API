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

    if (!user) {
      throw new Error('Usuario nao cadastado')
    }

    const validPassword = await compare(password, user!.password)

    if (!validPassword) {
      throw new Error('Senha invalida')
    }

    const token = app.jwt.sign({ sub: user?.id, expiresIn: '10 days' })

    if (token) {
      return reply
        .setCookie('token', token, { secure: true, path: '/' })
        .code(200)
        .send({ message: 'Authenticated', token })
    } else {
      reply.code(401).send('your email or password wrong!')
    }
  })
}
