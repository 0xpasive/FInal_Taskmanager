const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware"); // JWT middleware
const { CreateTask, getUserTasks, updateTask, deleteTask, closeTask, commentOnTask, deleteComment, addComments, getComments } = require("../controllers/taskController"); // Import the controller functions
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Create a task
router.post("/create",authMiddleware, upload.array('files',2), CreateTask);
router.get("/myTasks",authMiddleware,  getUserTasks); // Get all tasks for a user
router.post("/update/:taskId", authMiddleware, updateTask); // Update a task
router.delete("/delete/:taskId", authMiddleware, deleteTask);
router.post("/close/:taskId", authMiddleware, closeTask); // Close a task
// router.post("/comment/:taskId", authMiddleware, commentOnTask); // Comment on a task
// router.post("/comment/:taskId/:commentId", authMiddleware, deleteComment);
router.post("/:taskId/comments", authMiddleware, addComments);
router.get("/:taskId/comments", authMiddleware, getComments);

module.exports = router;
