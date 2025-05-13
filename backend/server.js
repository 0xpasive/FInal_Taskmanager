const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

//setup cors
const cors = require("cors");
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/auth", require("./routes/authRoutes")); // Your auth routes
app.use("/api/tasks", require("./routes/taskRoutes")); // Task routes
app.use("/api/teams", require("./routes/teamRoutes")); // Team routes


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
