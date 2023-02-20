
const User = require("../models/userModel") ;

 const finduserRole = (email) =>{
    return async function(req, res, next) {
        try {
            const findUser = await User.findOne({email}) ;
            if(findUser.role === "Admin"){
                
                next()
            }
           
        } catch (e) {
             console.log(e)
        }
    }
    
 
}

module.exports = finduserRole ;
