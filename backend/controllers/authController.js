const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");




const userSignup = async (req, res) => {
    try {
        const { username, fullname , organization, workmail,  email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });
    
        user = new User({ username, fullname , organization, workmail,  email, password });
        await user.save();
        
        
    
        res.status(201).json({ message: "User registered successfully" });
      } catch (err) {
        res.status(500).json({ message: "Server error 2" });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
        res.json({ token, user: { id: user._id, fullname: user.fullname,username: user.username, email: user.email } });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const myDetail = async (req, res) => {
    //fetch user detail using jwt auth bearer token
    try {
      const user = req.user;
      res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

const userDetail = async (req, res) => {
    //fetch user detail using user id
    try {
        const user = await User.findById(req.params.id).select("-password");
    
        if (!user) return res.status(404).json({ message: "User not found" });
    
        res.json(user);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
    
};



const changePassword = async (req, res) => {
    try {
        const user = req.user;
        
        const {currentPassword, newPassword} = req.body;

        if (!user) return res.status(404).json({ message: "User not found" });
      
    
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        console.log(isMatch);
        
        user.password = newPassword;
        await user.save();
    
        res.status(200).json({ message: "Password changed successfully" });
        


      
      } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};




module.exports = { userSignup, userLogin , myDetail , userDetail , changePassword};
// Compare this snippet from backend/routes/authRoutes.js:
