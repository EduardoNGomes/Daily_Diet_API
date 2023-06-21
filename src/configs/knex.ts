import { knex as setupKnex, Knex } from 'knex'
import { env } from '../env'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  pool: {
    afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
  },
  migrations: {
    extension: 'ts',
    directory: './src/db/migrations',
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
