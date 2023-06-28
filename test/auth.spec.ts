import request from 'supertest'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import path from 'path'
import { execSync } from 'child_process'

describe('Auth routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run -- knex migrate:rollback --all')

    execSync('npm run -- knex migrate:latest')
  })

  it('should auth user', async () => {
    // await app.ready()
    // execSync('npm run -- knex migrate:rollback --all')
    // execSync('npm run -- knex migrate:latest')
    await request(app.server)
      .post('/users')
      .attach(
        'avatarImage',
        path.resolve(__dirname, '../uploads/3d02592a68b6b1931d05-552397.jpg'),
      )
      .field('name', 'eduardo')
      .field('email', 'eduardo@example.com')
      .field('password', '12345678')

    const response = await request(app.server).post('/auth').send({
      email: 'eduardo@example.com',
      password: '12345678',
    })

    expect(response.headers).toHaveProperty('set-cookie')
    // await app.close()
  })
})
