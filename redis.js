const redis = require("redis");
require("dotenv").config();
const logger = require("./src/routes/logger")
// const REDIS_PORT ="redis://127.0.0.1:6379" ;
const redisPort = process.env.REDIS_URL;
const client = redis.createClient({ url: redisPort, legacyMode: true, connect_timeout: 30000, });

// IIFE  for redis connection //
(async () => {
  await client.connect();
})();
client.on("connect", () => console.log("Redis Client Connected"));
client.on("error", (err) => console.log("Redis Client Error", err));


// (async () => {
//   try {
//     await client.connect();
//     console.log("Redis Client Connected");
//   } catch (err) {
//     console.log("Redis Client Error", err);
//   }
// })();

// get all company cache //
function companyCacheData(req, res, next) {
  client.get("companyData", (err, data) => {
    if (err) throw err;

    if (data !== null) {
      return res
        .status(201)
        .send({ message: " company data from redis", companyDataResult: JSON.parse(data) });
    } else {
      next();
    }
  });
}

// get particular company //

function particularCompanyCache(req, res, next) {
  client.get("singleCompany", (err, data) => {
    if (err) throw err;
    if (data !== null) {
      return res
        .status(201)
        .send({ message: " company data from redis", getParticularCompany: JSON.parse(data) });
    } else {
      next();
    }
  });
}

// get position data //

function postionCacheData(req, res, next) {
  client.get("postionData", (err, data) => {
    if (err) throw err;
    if (data !== null) {
      return res
        .status(201)
        .send({ message: "position data from redis", positionEligibilityData: JSON.parse(data) });
    } else {
      next();
    }
  });
}

// get particular position //

function particularPositionCache(req, res, next) {
  client.get("particularPosition", (err, data) => {
    if (err) throw err;
    if (data !== null) {
      return res.status(201).send({
        message: " data of this position from redis",
        ParticularPositionEligible: JSON.parse(data),
      });
    } else {
      next();
    }
  });
}

module.exports = {
  client,
  companyCacheData,
  particularCompanyCache,
  postionCacheData,
  particularPositionCache,
};
