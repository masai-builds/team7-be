

const swaggerDoc = require("swagger-jsdoc") ;


const swaggerOption = {
    swaggerDefinition : {
        openapi : "3.0.0" ,
        info : {
            title : "Your API",
            version : "1.0.0" ,
            description: 'A sample API for testing Swagger',
        }
    },
    apis: ["./src/routes/user.js", "./src/routes/newCompany.js", "./src/routes/position.js", "./src/routes/eligibility.js"],
}

const swaggerSpec = swaggerDoc(swaggerOption)

module.exports = swaggerSpec ;
  