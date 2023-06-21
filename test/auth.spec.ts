import request from 'supertest'

import { expect, it } from 'vitest'
import { app } from '../src/server'
import path from 'path'
import { execSync } from 'child_process'

it('should auth user', async () => {
  await app.ready()
  execSync('npm run -- knex migrate:rollback --all')
  execSync('npm run -- knex migrate:latest')
  await request(app.server)
    .post('/users')
    .attach(
      'avatarImage',
      path.resolve(
        __dirname,
        '../uploads/edbda2213548a589cb66-Screenshot from 2023-06-03 13-05-07.png',
      ),
    )
    .field('name', 'eduardo')
    .field('email', 'eduardo@example.com')
    .field('password', '12345678')

  const response = await request(app.server).post('/auth').send({
    email: 'eduardo@example.com',
    password: '12345678',
  })

  await app.close()
  expect(response.headers).toHaveProperty('set-cookie')
})
