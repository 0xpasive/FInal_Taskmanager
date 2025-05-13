const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userSignup, userLogin, myDetail, userDetail, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup",  userSignup);
router.post("/login", userLogin);
router.get("/user", authMiddleware, myDetail);
router.get("/user/:id", userDetail)
router.put("/user/change-password", authMiddleware, changePassword);
  

module.exports = router;

