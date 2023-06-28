import fastify from 'fastify'

import { env } from './env'
import { join } from 'path'

import type { FastifyCookieOptions } from '@fastify/cookie'
import cookies from '@fastify/cookie'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import multer from 'fastify-multer'
import { TMP_FOLDER } from './configs/multer'

import { userRouter } from './routes/user'
import { authRoutes } from './routes/auth'
import { mealsRoutes } from './routes/meals'
import { statisticRoute } from './routes/statistic'

export const app = fastify()

app.register(cors, {
  origin: true,
  credentials: true,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})
app.register(multer.contentParser)

app.register(jwt, { secret: 'loocked' })
app.register(cookies, {} as FastifyCookieOptions)

app.register(require('@fastify/static'), {
  root: join(TMP_FOLDER),
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
    console.log('listening on port: ' + env.PORT)
  })
