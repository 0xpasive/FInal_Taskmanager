const Team = require("../models/Team");
const User = require("../models/User");

createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;
        
        // Check team limit (3 teams per user)
        const teamCount = await Team.countDocuments({ createdBy: userId });
        if (teamCount >= 3) {
            return res.status(400).json({ 
                error: 'Maximum team limit reached (3 teams per user)' 
            });
        }
    
        // Check if team name already exists for this user
        const existingTeam = await Team.findOne({ name, createdBy: userId });
        if (existingTeam) {
            return res.status(400).json({ message: "Team with this name already exists" });
        }
        
        // Create new team
        const newTeam = new Team({
            name,
            members: [{ user: userId, isVerified: true }], // Creator is automatically verified
            createdBy: userId
        });
        
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating team", error: error.message });
    }
};

getUserTeams = async (req, res) => {
    try {
        const userId = req.user._id;
        const teams = await Team.find({ 
            $or: [
                { "members.user": userId },
                { createdBy: userId }
            ]
        }).populate("members.user", "id fullname email")
          .populate("createdBy", "id fullname email");
        
        res.status(200).json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching teams", error: error.message });
    }
};

addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email } = req.body;
        const requestingUserId = req.user._id;

        // Verify the requesting user is the team creator
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (!team.createdBy.equals(requestingUserId)) {
            return res.status(403).json({ message: "Only team creator can add members" });
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: "User with this email not found" });
        }

        // Check if user is already a member
        const isAlreadyMember = team.members.some(member => 
            member.user.equals(userToAdd._id)
        );
        
        if (isAlreadyMember) {
            return res.status(400).json({ message: "User is already a team member" });
        }

        // Add new member (unverified by default)
        team.members.push({ user: userToAdd._id, isVerified: false });
        await team.save();

        const updatedTeam = await Team.findById(teamId)
            .populate("members.user", "fullname email")
            .populate("createdBy", "fullname email");

        res.status(200).json(updatedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding member", error: error.message });
    }
};

removeMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;
        const requestingUserId = req.user._id;
        

        const team = await Team.findById(teamId);
        
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // Only creator can remove members (except themselves)
        if (!team.createdBy.equals(requestingUserId)) {
            return res.status(403).json({ message: "Only team creator can remove members" });
        }

        // Prevent creator from removing themselves
        if (userId === requestingUserId.toString()) {
            return res.status(400).json({ message: "Creator cannot remove themselves from team" });
        }

        // Remove the member
        team.members = team.members.filter(
            member => !member.user.equals(userId)
        );
        
        await team.save();

        const updatedTeam = await Team.findById(teamId)
            .populate("members.user", "fullname email")
            .populate("createdBy", "fullname email");

        res.status(200).json(updatedTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing member", error: error.message });
    }
};

getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "fullname email");
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        

        const team = await Team.findOne({ _id: id, createdBy: userId });
        
        if (!team) {
            return res.status(404).json({ 
                error: 'Team not found or not authorized for deletion' 
            });
        }

        await Team.deleteOne({ _id: id });
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ 
            message: "Error deleting team",
            error: error.message 
        });
    }
};
getMyInvitations = async (req, res) => {
    try{
        const user = req.user;

        const teams = await Team.find({ 
            $or: [
                { "members.user": user._id },
                { isVerified: "true" }
            ]

        });
        res.status(200).json([teams]);
    }
    catch (error){
        res.status(500).json({ message: "Error fetching teams", error: error.message });
    }


    
};

module.exports = {
    createTeam,
    getUserTeams,
    addMember,
    removeMember,
    getAllUsers,
    deleteTeam,
    getMyInvitations
};