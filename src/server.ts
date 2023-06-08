import fastify from 'fastify'
import { env } from './env'
import multer from 'fastify-multer'
import { userRouter } from './routes/user'
import { join } from 'path'
import jwt from '@fastify/jwt'
import cookies from '@fastify/cookie'
import { authRoutes } from './routes/auth'

const app = fastify()

// Uploads file
app.register(multer.contentParser)

app.register(jwt, { secret: 'loocked' })
app.register(cookies)

app.register(require('@fastify/static'), {
  root: join(__dirname, '../uploads'),
})
// Routes
app.register(userRouter)
app.register(authRoutes)

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('listening on port: 3333')
  })
