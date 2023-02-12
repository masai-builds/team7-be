const express= require('express');
const connection= require("./src/config/db")
const app = express();
const authRoute = require('./src/controller/user');

app.use(express.urlencoded({ extended:true }));
app.use(express.json());


app.use("/auth",authRoute)


app.get("/",(req,res)=>{
res.send({message:"welcome to our website"})
})


const port = process.env.PORT || 8081;

app.listen(port,async()=>{
    await connection;
console.log("listening on port 8080")
});