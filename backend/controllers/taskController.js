const Task = require("../models/Task");
const User = require("../models/User");
const express = require("express");
const Team = require('../models/Team');

const jwt = require("jsonwebtoken");

const CreateTask = async (req, res) => {
    try {
        
        const user = req.user;
        let { title, description, dueDate, priority, assignedTo, isTeamTask } = req.body;
        if (!isTeamTask) {
                assignedTo = null;
        }
        
    
        // Create a new task instance
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            assignedTo,
            isTeamTask,
            createdBy: user._id,  // Use the user ID from the request
        });
    
        // Save the task to the database
        const savedTask = await newTask.save();
    
        res.status(201).json(savedTask);  // Return the saved task as a response
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating task' });
    }
};

//get task of the user based on provided bearer token
const getUserTasks = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get teams where the user is a member
        const userId = req.user._id;

        const teams = await Team.find({
            $or: [
                { members: { $elemMatch: { user: userId, isVerified: true } } },
                { createdBy: userId }
            ]
        })
        
        const teamIds = teams.map(team => team._id);

        // Find tasks either created by the user OR assigned to user's teams
        const tasks = await Task.find({
            $or: [
                { createdBy: user._id },
                { 
                    isTeamTask: true,
                    'assignedTo': { $in: teamIds }
                }
            ]
        }).populate('assignedTo');

        

        res.json(tasks);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
};


const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const { title, description, dueDate, priority, assignedTo } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, description, dueDate, priority, assignedTo },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating task' });
    }
};
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting task' });
    }
};
const closeTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const closedTask = await Task.findByIdAndUpdate(
            taskId,
            { status: 'completed' },
            { new: true }
        );
        
        if (!closedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json(closedTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error closing task' });
    }
};

const commentOnTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ message: 'Comment is required' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { comments: { comment: comment.trim(), createdAt: new Date() } } },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error commenting on task' });
    }
};


    




module.exports = {
    CreateTask,
    getUserTasks,
    updateTask,
    deleteTask,
    closeTask,
    commentOnTask
};

