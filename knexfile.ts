module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './src/db/database.db',
    },
    migrations: {
      extension: 'ts',
      directory: './src/db/migrations',
    },
    useNullAsDefault: true,
  },
}
