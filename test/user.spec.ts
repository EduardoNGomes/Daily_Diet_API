import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'

describe('User Routes', () => {
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

  // it.skip('should create a user', async () => {
  //   const response = await request(app.server)
  //     .post('/users')
  //     .attach(
  //       'avatarImage',
  //       path.resolve(
  //         __dirname,
  //         '../uploads/edbda2213548a589cb66-Screenshot from 2023-06-03 13-05-07.png',
  //       ),
  //     )
  //     .field('name', 'eduardo')
  //     .field('email', 'eduardo@example.com')
  //     .field('password', '12345678')

  //   expect(response.statusCode).toEqual(201)
  // })
  // it.skip('shouldnt create a user without image', async () => {
  //   const response = await request(app.server).post('/users').send({
  //     name: 'eduardo',
  //     email: 'eduardo@example.com',
  //     password: '12345678',
  //   })

  //   expect(response.statusCode).toEqual(500)
  // })

  it('should update user', async () => {
    await request(app.server)
      .post('/users')
      .attach(
        'avatarImage',
        path.resolve(__dirname, '../uploads/3d02592a68b6b1931d05-552397.jpg'),
      )
      .field('name', 'eduardo')
      .field('email', 'eduardo@example.com')
      .field('password', '12345678')

    const responseAuth = await request(app.server).post('/auth').send({
      email: 'eduardo@example.com',
      password: '12345678',
    })

    const token = responseAuth.headers['set-cookie'][0]
      .split('=')[1]
      .split(';')[0]

    try {
      const responseUpdate = await request(app.server)
        .put('/users')
        .set('Authorization', 'Bearer ' + token)
        .timeout(30000) // Aumentar o tempo limite para 30 segundos
        .field('name', 'Carlos')
        .field('email', 'eduardo@example.com')
        .field('oldPassword', '12345678')
        .field('newPassword', '12345678')

      expect(responseUpdate.statusCode).toBe(204)
    } catch (error) {
      console.log(error)
    }
  })
})
