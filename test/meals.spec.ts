import request from 'supertest'

import { app } from '../src/server'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'child_process'
import path from 'path'

describe('Meals Routes', () => {
  let token = ''
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

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

  it('should create a new meal', async () => {
    const createMeals = await request(app.server)
      .post('/meals')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Frango',
        description: 'Frango description',
        isOnDiet: true,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      })

    expect(createMeals.text).toEqual('Prato criado com sucesso')
  })
  it('should get all meals', async () => {
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
        isOnDiet: true,
        created_at: '2023-06-19 15:09:21',
        updated_at: '2023-06-19 15:09:21',
      })

    const getAllMeals = await request(app.server)
      .get('/meals')
      .set('Authorization', 'Bearer ' + token)

    expect(getAllMeals.body).toHaveLength(2)
  })
  it('should get a meal', async () => {
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

    const getAllMeals = await request(app.server)
      .get('/meals')
      .set('Authorization', 'Bearer ' + token)

    const mealId = getAllMeals.body[0].items[0].id

    const getMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Authorization', 'Bearer ' + token)

    expect(getMeal.body).toEqual(
      expect.objectContaining({
        name: 'Frango',
        description: 'Frango description',
        isOnDiet: 1,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      }),
    )
  })
  it('should update meals', async () => {
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

    const getAllMeals = await request(app.server)
      .get('/meals')
      .set('Authorization', 'Bearer ' + token)

    const mealId = getAllMeals.body[0].items[0].id

    const updateMeal = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Carne',
        description: 'Carne description',
        isOnDiet: true,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      })

    expect(updateMeal.text).toEqual('Prato atualizado com sucesso')

    const getMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Authorization', 'Bearer ' + token)

    expect(getMeal.body).toEqual(
      expect.objectContaining({
        name: 'Carne',
        description: 'Carne description',
        isOnDiet: 1,
        created_at: '2023-06-09 15:09:21',
        updated_at: '2023-06-09 15:09:21',
      }),
    )
  })
  it('should delete a meal', async () => {
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

    const getAllMeals = await request(app.server)
      .get('/meals')
      .set('Authorization', 'Bearer ' + token)

    const mealId = getAllMeals.body[0].items[0].id

    const deleteMeal = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Authorization', 'Bearer ' + token)

    expect(deleteMeal.text).toEqual('Refeicao excluido com sucesso')
  })
})
