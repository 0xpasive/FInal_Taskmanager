

const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // JWT middleware
const { createTeam, getUserTeams, addMember, removeMember, getAllUsers, deleteTeam } = require("../controllers/teamController"); // Import the controller functions


router.post("/create",authMiddleware,  createTeam); // Create a team
router.get("/myTeams",authMiddleware, getUserTeams); // Get all teams for a user
router.post("/add/:teamId",authMiddleware,  addMember); // add a member to a team
router.post("/remove/:teamId",authMiddleware, removeMember); // remove a member from a team
router.post("/users",authMiddleware, getAllUsers); // Get all users
router.post("/delete/:id", authMiddleware, deleteTeam);

module.exports = router;