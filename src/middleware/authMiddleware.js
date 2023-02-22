const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await userModel.findById(decoded.userId);
    if (user.role === "Admin") {
      next();
    } else if (user.role === "Student" && req.method === "GET") {
      next();
    } else {
      res.status(401).send({ message: "Unauthorized access" });
    }
  } catch (error) {
    return res.status(401).send({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
