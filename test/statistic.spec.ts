import request from 'supertest'
import { app } from '../src/server'

import { execSync } from 'child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'

describe('Metrics Router', () => {
  let token = ''
  beforeAll(async () => await app.ready())
  afterAll(async () => await app.close())

  beforeEach(async () => {
    execSync('npm run -- knex migrate:rollback --all')
    execSync('npm run -- knex migrate:latest')

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

    token = responseAuth.headers['set-cookie'][0].split('=')[1].split(';')[0]
  })

  it('should return statistics with values equal to zero', async () => {
    const getStatistic = await request(app.server)
      .get('/statistic')
      .set('Authorization', 'Bearer ' + token)

    expect(getStatistic.body).toEqual(
      expect.objectContaining({
        allMeals: 0,
        mealsOnDiet: 0,
        mealsOffDiet: 0,
        dietSequence: 0,
        percentageOnDiet: 0,
        percentageOffDiet: 0,
      }),
    )
  })

  it('should user statistics with values', async () => {
    await request(app.server)
      .post('/meals')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Frango',
        description: 'Frango description',
        isOnDiet: true,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      })
    await request(app.server)
      .post('/meals')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Frango',
        description: 'Frango description',
        isOnDiet: false,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      })

    const getStatistic = await request(app.server)
      .get('/statistic')
      .set('Authorization', 'Bearer ' + token)

    expect(getStatistic.body).toEqual(
      expect.objectContaining({
        allMeals: 2,
        mealsOnDiet: 1,
        mealsOffDiet: 1,
        dietSequence: 0,
        percentageOnDiet: '50.00',
        percentageOffDiet: '50.00',
      }),
    )
  })
})
