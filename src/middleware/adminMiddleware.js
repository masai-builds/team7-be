const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
  const token = req.cookies.usercookie;
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_KEY);
    if (decodeToken.role !== "Admin") {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = adminMiddleware;
