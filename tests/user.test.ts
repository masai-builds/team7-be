
const supertest = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const userModel = require('../src/models/userModel');
// const { clearRedisCache } = require('../middlewares/redisCacheMiddleware');
const companyData = require('../src/models/newCompanyModel');
const { client } = require('../redis');

describe('POST /signup', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DATABASE, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      });
      afterAll(async () => {
        await mongoose.connection.close();
      });
      it('should return a 201 status code and success message when a new user signs up', async () => {
        const existingUser = await userModel.findOne({ email: 'testuser@example.com' });
      
        if (existingUser) {
          const res = await supertest(app)
            .post('/auth/signup')
            .send({
              name: 'Test User',
              email: 'testuser@example.com',
              password: 'Test@123',
              rePassword: 'Test@123',
              uuid: 'ujk686798354',
              role: 'Admin',
              emailConfirmed: false,
            });
      
          expect(res.statusCode).toEqual(400);
          expect(res.body.message).toContain('user already registered');
        } else {
          const res = await supertest(app)
            .post('/auth/signup')
            .send({
              name: 'Test User',
              email: 'testuser@example.com',
              password: 'Test@123',
              rePassword: 'Test@123',
              uuid: 'ujk686798354',
              role: 'Admin',
              emailConfirmed: false,
            });
      
          expect(res.statusCode).toEqual(201);
          expect(res.body.message).toContain('successfully registered');
        }
      });
    

//   it('should return a 400 status code and error message when password and re-entered password do not match', async () => {
//     const res = await request(app)
//       .post('/auth/signup')
//       .send({
//         name: 'Test User',
//         email: 'testuser@example.com',
//         password: 'Test@123',
//         rePassword: 'Test@4'
//       });
//       expect(res.statusCode).toEqual(400);
//      expect(res.body.message).toContain("Please make sure your passwords match.");
   
//   });

//   it('should return a 400 status code and error message when invalid email is provided', async () => {
//     const res = await request(app)
//       .post('/auth/signup')
//       .send({
//         name: 'Test User',
//         email: 'testuserexample.com',
//         password: 'Test@123',
//         rePassword: 'Test@123'
//       });
//     expect(res.statusCode).toEqual(400);
//     expect(res.body.message).toContain("Please provide a valid email address.");
//   });

//   it('should return a 400 status code and error message when password is weak', async () => {
//     const res = await request(app)
//       .post('/auth/signup')
//       .send({
//         name: 'Test User',
//         email: 'testuser@example.com',
//         password: 'password',
//         rePassword: 'password'
//       });
//     expect(res.statusCode).toEqual(400);
//     expect(res.body.message).toContain("Password must contain at least 8 characters, including at least 1 number, 1 lowercase letter, and 1 uppercase letter.");
//   });

  // Add more test cases as needed
});



describe('GET /getCompany', () => {
  //   beforeEach(async () => {
  //     // Clear Redis cache before each test
  //     await clearRedisCache();
  //   });
  
    afterAll(async () => {
      // Close Redis connection after all tests are done
      await client.quit();
    });
  
    it('should return company data from database if it exists and cache it in Redis', async () => {
      // Insert sample data in database
      const sampleData = [{
          "companyName": "Jest",
          "websiteUrl": "www.Jest.com",
          "companySegment": "lorem lorem",
          "industry": "lorem",
          "description": "string lorem",
          "whyApply": "string lorem",
          "linkdinUrl": "string lorem",
          "glassdoorUrl": "www.lorem.com",
          "ambitionBox": "www.lorem.com",
          "leadSource": "www.lorem.com"
        }, {
          "companyName": "Supertest",
          "websiteUrl": "www.Supertest.com",
          "companySegment": "lorem lorem",
          "industry": "lorem",
          "description": "string lorem",
          "whyApply": "string lorem",
          "linkdinUrl": "string lorem",
          "glassdoorUrl": "www.lorem.com",
          "ambitionBox": "www.lorem.com",
          "leadSource": "www.lorem.com"
        }];
      await companyData.insertMany(sampleData);
  
      // Make GET request to /getCompany endpoint
      const response = await supertest(app).get('/getCompany');
  
      // Assert response status code and message
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('company Data from database');
  
      // Assert that the returned data matches the inserted data
      expect(response.body.companyDataResult).toEqual(sampleData);
  
      // Assert that the data is cached in Redis
      const cachedData = await client.getAsync('companyData');
      expect(cachedData).toEqual(JSON.stringify(sampleData));
    });
  
    it('should return 404 if no company data exists in the database', async () => {
      // Clear existing data from database
      await companyData.deleteMany({});
  
      // Make GET request to /getCompany endpoint
      const response = await supertest(app).get('/getCompany');
  
      // Assert response status code and message
      expect(response.status).toBe(404);
      expect(response.body.messge).toBe('no data found');
    });
  
    it('should return 500 if an error occurs while fetching company data', async () => {
      // Mock the find method to throw an error
      jest.spyOn(companyData, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
  
      // Make GET request to /getCompany endpoint
      const response = await supertest(app).get('/getCompany');
  
      // Assert response status code and message
      expect(response.status).toBe(500);
      expect(response.body.message).toContain('error comes while getcompany');
    });
  });
  