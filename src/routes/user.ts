import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { upload } from '../configs/multer'
import { hash } from 'bcrypt'
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
        password: z.string(),
      })
      const { name, email, password } = bodySchema.parse(request.body)
      const image = request.file

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
  app.get('/users/avatar/:avatarUrl', (request, reply) => {
    const paramsSchema = z.object({
      avatarUrl: z.string(),
    })
    const { avatarUrl } = paramsSchema.parse(request.params)

    return reply.sendFile(avatarUrl)
  })
}
