// const request = require('supertest');
// const app = require('../../index');

// describe("register",()=>{
//     it("should register to the platform", async()=>{
//         const response = await request(app).post('/auth/signup').send({
//             name: "Test User",
//             email: "test@example.com",
//             password: "Test1234",
//             rePassword: "Test1234"
//         });
//         expect(response.status).toBe(201);
//         expect(response.body).toEqual({ message: 'successfully registered' });
//     });
// });
const request = require('supertest');
const app = require('../index');
const userModel = require('../models/user');

describe('Registration Route', () => {
  beforeAll(async () => {
    // clear the user collection before running the tests
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    // close the app after running the tests
    await app.close();
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'invalid email',
        password: 'Test1234',
        rePassword: 'Test1234',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide a valid email address.');
  });

  it('should return 400 if password is too weak', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        rePassword: 'weak',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      'Password must contain at least 8 characters, including at least 1 number, 1 lowercase letter, and 1 uppercase letter.'
    );
  });

  it('should return 400 if passwords do not match', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1234',
        rePassword: 'MismatchedPassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please make sure your passwords match.');
  });
})