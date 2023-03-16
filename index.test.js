const request = require('supertest');
process.env.PORT = '3000';

const app = require('./index');

describe('API endpoint tests', () => {
  test('GET / should return 200 and a welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'welcome to our website' });
  });
});


