const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model

module.exports = async function (req, res, next) {
  // Extract token from header
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach full user object to request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
};