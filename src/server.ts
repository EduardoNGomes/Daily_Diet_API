import fastify from 'fastify'

const app = fastify()

app.listen({ port: 3333 }).then(() => {
  console.log('listening on port: 3333')
})
