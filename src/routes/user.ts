import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { upload } from '../configs/multer'
import { hash, compare } from 'bcrypt'
import { knex } from '../configs/knex'
import { randomUUID } from 'crypto'

export async function userRouter(app: FastifyInstance) {
  app.post(
    '/users',
    { preHandler: upload.single('avatarImage') },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string().min(8),
      })
      const { name, email, password } = bodySchema.parse(request.body)
      const image = request.file

      const userAlreadyExists = await knex('users').where({ email }).first()

      if (userAlreadyExists) {
        throw new Error('Email ja cadastrado')
      }

      if (!image) {
        throw new Error('Please choose a valid image')
      }

      const passwordHashed = await hash(password, 10)

      await knex('users').insert({
        id: randomUUID(),
        name,
        email,
        avatarUrl: image.filename,
        password: passwordHashed,
      })

      return reply.send()
    },
  )

  // change id from params
  app.get(
    '/users',
    { preHandler: (request) => request.jwtVerify() },
    async (request, reply) => {
      const token = request.cookies.token
      const { sub } = app.jwt.decode(token!)

      const user = await knex('users').where({ id: sub }).first()

      return reply.send(user)
    },
  )

  app.put(
    '/users',
    { preHandler: (request) => request.jwtVerify() },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string().optional(),
        email: z.string(),
        avatarUrl: z.string().optional(),
        oldPassword: z.string().min(8),
        newPassword: z.string().min(8),
      })
      const token = request.cookies.token
      const { sub } = app.jwt.decode(token)

      const { name, email, oldPassword, newPassword, avatarUrl } =
        bodySchema.parse(request.body)

      const user = await knex('users')
        .where({ id: sub })
        .andWhere({ email })
        .first()

      if (!user) {
        throw new Error('Unauthorized')
      }

      const validPassword = await compare(oldPassword, user!.password)

      if (!validPassword) {
        throw new Error('Senha invalida')
      }

      const password = await hash(newPassword, 10)

      await knex('users')
        .update({
          name: name || user!.name,
          email,
          password,
          avatarUrl: avatarUrl || user!.avatarUrl,
          created_at: user?.created_at,
          updated_at: knex.fn.now(),
        })
        .where({ id })

      return reply.send('Dados do usuario atualizados com sucesso')
    },
  )

  // Get user Image
  app.get('/users/avatar/:avatarUrl', (request, reply) => {
    const paramsSchema = z.object({
      avatarUrl: z.string(),
    })
    const { avatarUrl } = paramsSchema.parse(request.params)

    return reply.sendFile(avatarUrl)
  })
}
