const mongoose = require('mongoose')
require('dotenv').config({ path: ".env" });
mongoose.set('strictQuery', false);

const url=process.env.DATABASE
const connection = mongoose.connect(url)
.then(() => console.log("Database successfully connect"))
.catch((e) => console.log('error'))


module.exports = connection


// const mongoose = require('mongoose');
// require('dotenv').config({ path: ".env" });
// mongoose.set('strictQuery', false);

// const url = process.env.DATABASE;

// const connection = async () => {
//   try {
//     await mongoose.connect(url);
//     console.log("Database successfully connected");
//   } catch (error) {
//     console.log('Error connecting to database:', error);
//   }
// };

// module.exports = connection;
