
const Team = require("../models/Team");

const User = require("../models/User");

createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;
        ;

        const teamCount = await Team.countDocuments({ where: {  createdBy: req.user.id } });
        if (teamCount >= 3) {
            return res.status(400).json({ 
            error: 'Maximum team limit reached (3 teams per user)' 
            });
        }
    
        // Check if the team already exists for this user 
        const existingTeam = await Team.findOne({ name, createdBy: req.user.id });
        if (existingTeam) {
            return res.status(400).json({ message: "Team already exists" });
        }
        // Create a new team
        const newTeam = new Team({
            name,
            members: [userId],
            createdBy: userId
        });
        await newTeam.save();
        res.status(201).json(newTeam);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating team" });
    }
};

getUserTeams = async (req, res) => {
    try {
        const userId = req.user._id;
        const teams = await Team.find({ members: userId }).populate("members", "fullname email"); 
        res.status(200).json(teams);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching teams" });
    }
};

addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body; // Assuming userId is sent in the request body

        //check if the user is already a member of the team
        const existingTeam = await Team.findById(teamId);
        if (existingTeam.members.includes(userId)) {
            return res.status(400).json({ message: "User is already a member of the team" });
        }

        // Find the team and add the member
        const team = await Team.findByIdAndUpdate(
            teamId,
            { $addToSet: { members: userId } }, // Use $addToSet to avoid duplicates
            { new: true }
        ).populate("members", "fullname email");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json(team);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding member" });
    }
};

removeMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body; // Assuming userId is sent in the request body

        // Find the team and remove the member
        const team = await Team.findByIdAndUpdate(
            teamId,
            { $pull: { members: userId } }, // Use $pull to remove the member
            { new: true }
        ).populate("members", "name email");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.status(200).json(team);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing member" });
    }
};

getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "fullname email"); // Fetch all users with name and email
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

deleteTeam = async ( req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
    
        // Find team and verify owner
        const team = await Team.findOne({ where: { id, created_by: userId } });
        if (!team) {
          return res.status(404).json({ error: 'Team not found or not authorized' });
        }
    
        await team.destroy();
        res.json({ message: 'Team deleted successfully' });
      } catch (err) {
        next(err);
      }

};


module.exports = {
    createTeam,
    getUserTeams,
    addMember,
    removeMember,
    getAllUsers,
    deleteTeam
};

