// Write your tests here
const request = require('supertest')
const Auth = require('./auth/auth-model')
const jokes = require('./jokes/jokes-router')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')
const jwtDecode = require('jwt-decode')
const server = require('./server')

const dat = [
  {
    "id": "0189hNRf2g",
    "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
  },
  {
    "id": "08EQZ8EQukb",
    "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
  },
  {
    "id": "08xHQCdx5Ed",
    "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
  },
];

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

describe('users sanity check', () => {
  test('sanity check', () => {
    expect(Auth).toBeDefined()
    expect(jokes).toBeDefined()
  })
  test('testing enviromnet', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })

  describe('register', () => {
    it('able to insert a new user', async () => {
      await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(await Auth.getAll()).toHaveLength(1)
      
    })
    it('have the correct id', async () => {
      const result = await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(result.body[0]).toMatchObject({ id: 1, username: 'sam' })
    })
  })
  describe('login', ()=>{
    test('login success', async ()=>{
      const data = await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(data.body[0]).toMatchObject({ id: 1, username: 'sam' })
      const result = await request(server).post('/api/auth/login').send({username: 'sam', password: "1234"})
      expect(result.body).toBeDefined()
    })
    test('login return token', async ()=>{
      const data = await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(data.body[0]).toMatchObject({ id: 1, username: 'sam' })
      const result = await request(server).post('/api/auth/login').send({username: 'sam', password: "1234"})
      expect(result.body.token).toBeDefined()
    })
  })
  describe('getall()', ()=>{
    test('getall with token sucess', async ()=>{
      const regis = await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(regis.body[0]).toMatchObject({ id: 1, username: 'sam' })
      const logi = await request(server).post('/api/auth/login').send({username: 'sam', password: "1234"})
      expect(logi.body.token).toBeDefined()
      const data =  await request(server).get('/api/jokes/').set('Authorization', `${logi.body.token}`)
      expect(data.body).toEqual(dat)
      console.log(data.body)
    })
    test('getAll without token fail', async ()=>{
      const regis = await request(server).post('/api/auth/register').send({username: 'sam', password: "1234"})
      expect(regis.body[0]).toMatchObject({ id: 1, username: 'sam' })
      const logi = await request(server).post('/api/auth/login').send({username: 'sam', password: "1234"})
      expect(logi.body.token).toBeDefined()
      const data =  await request(server).get('/api/jokes/')
      expect(data.body.message).toBe("token required")
    })
  })
})
