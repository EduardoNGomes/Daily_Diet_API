import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './src/db/database.db',
  },
  migrations: {
    extension: 'ts',
    directory: './src/db/migrations',
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
