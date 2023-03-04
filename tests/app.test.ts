

// require("dotenv").config();

// const supertest = require("supertest");
// const app = require("../index");
// const client = require("redis").createClient(process.env.REDIS_URL);

// describe("Test the root path", () => {
//   let server;

//   beforeAll(async () => {
//     await new Promise((resolve) => client.once("ready", resolve));
//     server = app.listen(process.env.PORT);
//   });
//   test("It should be response with 200 code", async () => {
//     const response = await supertest(app).get("/");
//     expect(response.statusCode).toBe(200);
//   });

//   afterAll(() => {
//     server.close();
//     client.quit();
//   });

  
// });










require("dotenv").config();

const supertest = require("supertest") ;
const app = require("../index") ;


describe("Test the root path", () => {
    
    test("It should be response with 200 code", async() => {
       
          const response = await supertest(app).get("/") ;
          expect(response.statusCode).toBe(200) ;
      
    })
})