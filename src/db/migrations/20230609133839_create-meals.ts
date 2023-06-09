import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').notNullable().primary()
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.string('name').notNullable()
    table.string('description')
    table.boolean('isOnDiet').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}
