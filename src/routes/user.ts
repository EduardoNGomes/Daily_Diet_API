import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hash, compare } from 'bcrypt'
import { knex } from '../configs/knex'
import { randomUUID } from 'crypto'
import { MULTER } from '../configs/multer'
import multer from 'fastify-multer'
import { DiskStorage } from '../utils/DiskStorage'
import { AppError } from '../utils/AppError'

const upload = multer(MULTER)

export async function userRouter(app: FastifyInstance) {
  app.post(
    '/users',
    { preHandler: upload.single('avatarImage') },
    async (request, reply) => {
      const bodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      })
      const { name, email, password } = bodySchema.parse(request.body)
      const image = request.file

      const userAlreadyExists = await knex('users')
        .where({ email: email.toLowerCase() })
        .first()

      if (userAlreadyExists) {
        throw new AppError('Email ja cadastrado', 400)
      }

      if (!image) {
        throw new AppError('Please choose a valid image', 400)
      }

      const passwordHashed = await hash(password, 10)

      await knex('users').insert({
        id: randomUUID(),
        name,
        email: email.toLowerCase(),
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
      const { sub } = request.user

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
      const { sub } = request.user

      const { name, email, oldPassword, newPassword } = bodySchema.parse(
        request.body,
      )
      const image = request.file

      const user = await knex('users')
        .where({ id: sub })
        .andWhere({ email: email.toLowerCase() })
        .first()

      if (!user) {
        throw new AppError('Unauthorized')
      }

      const validPassword = await compare(oldPassword, user!.password)

      if (!validPassword) {
        throw new AppError('Senha invalida', 401)
      }
      const diskStorage = new DiskStorage()

      if (user.avatarUrl && image) {
        await diskStorage.deleteFile(user.avatarUrl)
      }

      const password = await hash(newPassword, 10)

      await knex('users')
        .update({
          name,
          email: email.toLowerCase(),
          password,
          avatarUrl: image ? image.filename : user.avatarUrl,
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
