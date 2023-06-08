import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    token: {
      sub: string
      name: string
      avatarUrl: string
    }
  }
}
