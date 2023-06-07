import fastify from 'fastify'
import { env } from './env'
import multer from 'fastify-multer'
import { userRouter } from './routes/user'
import { join } from 'path'

const app = fastify()

// Uploads file
app.register(multer.contentParser)

app.register(require('@fastify/static'), {
  root: join(__dirname, '../uploads'),
})
// Routes
app.register(userRouter)

app.listen({ port: env.PORT }).then(() => {
  console.log('listening on port: 3333')
})
