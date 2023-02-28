const redis = require("redis") ;
require('dotenv').config();


// const REDIS_PORT ="redis://127.0.0.1:6379" ;
const redisPort = process.env.REDIS_PORT ;

const client = redis.createClient({ url: redisPort, legacyMode: true }) ;

// IIFE  for redis connection //

(async () => {
    await client.connect();
  })();
//   client.connect();
  client.on('connect', () => console.log('::> Redis Client Connected'));
  client.on('error', (err) => console.log('<:: Redis Client Error', err));




// get all company cache //
 function companyCacheData(req, res, next){

    client.get("companyData", (err, data) => {
        if(err) throw err ;

        if(data !== null){
            return res.status(201).send({message : " company data from redis", data : JSON.parse(data)})
        }else {
            next()
        }
    })

  }

// get particular company // 

function particularCompanyCache(req, res, next){

    client.get("singleCompany", (err, data) => {
          if(err) throw err ;
          if(data !== null){
            return res.status(201).send({message : " company data from redis", data : JSON.parse(data)})
          }else {
            next()
          }
    })
}

 module.exports = {client, companyCacheData,particularCompanyCache }