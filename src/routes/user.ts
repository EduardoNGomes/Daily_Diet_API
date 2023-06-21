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

      return reply.status(201).send('Usuário criado com sucesso')
    },
  )
  app.get(
    '/users',
    { preHandler: (request) => request.jwtVerify() },
    async (request, reply) => {
      const token = request.headers.authorization
      const { sub } = app.jwt.decode(token!.split(' ')[1])

      const user = await knex('users').where({ id: sub }).first()

      return reply.send({
        name: user?.name,
        avatarUrl: user?.avatarUrl,
        email: user?.email,
      })
    },
  )
  app.put(
    '/users',
    {
      preHandler: [
        (request) => request.jwtVerify(),
        upload.single('avatarImage'),
      ],
    },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        email: z.string(),
        oldPassword: z.string().min(8),
        newPassword: z.string().min(8),
      })

      const token = request.headers.authorization
      const { sub } = app.jwt.decode(token!.split(' ')[1])

      const { name, email, oldPassword, newPassword } = bodySchema.parse(
        request.body,
      )
      const image = request.file

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
          name,
          email,
          password,
          avatarUrl: image ? image.filename : user!.avatarUrl,
          updated_at: knex.fn.now(),
        })
        .where({ id: sub })

      return reply.send('Dados do usuário atualizados com sucesso')
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
