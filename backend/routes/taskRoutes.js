const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware"); // JWT middleware
const { CreateTask, getUserTasks, updateTask, deleteTask, closeTask, commentOnTask } = require("../controllers/taskController"); // Import the controller functions
const authMiddleware = require("../middleware/authMiddleware");

// Create a task
router.post("/create",authMiddleware, CreateTask);
router.get("/myTasks",authMiddleware,  getUserTasks); // Get all tasks for a user
router.post("/update/:taskId", authMiddleware, updateTask); // Update a task
router.delete("/delete/:taskId", authMiddleware, deleteTask);
router.post("/close/:taskId", authMiddleware, closeTask); // Close a task
router.post("/comment/:taskId", authMiddleware, commentOnTask); // Comment on a task
   

module.exports = router;
