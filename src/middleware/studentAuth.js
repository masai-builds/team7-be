const jwt = require("jsonwebtoken");

const studentAuth = (req, res, next) => {
  const token = req.cookies.usercookieAuth;

  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, decodeToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        console.log(decodeToken);
        if (decodeToken.role !== "Student") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  }
};

module.exports = studentAuth;
