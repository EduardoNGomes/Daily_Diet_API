import fastify from 'fastify'
import { userRouter } from './routes/user'

const app = fastify()

app.register(userRouter)

app.listen({ port: 3333 }).then(() => {
  console.log('listening on port: 3333')
})
