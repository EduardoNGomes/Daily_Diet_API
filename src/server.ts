import fastify from 'fastify'
import { env } from './env'
import multer from 'fastify-multer'
import { userRouter } from './routes/user'
import { join } from 'path'
import jwt from '@fastify/jwt'
import cookies from '@fastify/cookie'
import { authRoutes } from './routes/auth'
import { mealsRoutes } from './routes/meals'
import { statisticRoute } from './routes/statistic'
import type { FastifyCookieOptions } from '@fastify/cookie'
import cors from '@fastify/cors'

const app = fastify()

// Uploads file
app.register(cors, { origin: true, credentials: true })
app.register(multer.contentParser)

app.register(jwt, { secret: 'loocked' })
app.register(cookies, {} as FastifyCookieOptions)

app.register(require('@fastify/static'), {
  root: join(__dirname, '../uploads'),
})
// Routes
app.register(authRoutes)
app.register(userRouter)
app.register(mealsRoutes)
app.register(statisticRoute)

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('listening on port: 3333')
  })
