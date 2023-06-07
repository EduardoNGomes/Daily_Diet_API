import fastify from 'fastify'
import { env } from './env'
import { userRouter } from './routes/user'
const app = fastify()

app.register(userRouter)

app.listen({ port: env.PORT }).then(() => {
  console.log('listening on port: 3333')
})
