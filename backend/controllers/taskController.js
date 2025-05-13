const Task = require("../models/Task");
const User = require("../models/User");
const express = require("express");

const jwt = require("jsonwebtoken");

const CreateTask = async (req, res) => {
    try {
        
        const user = req.user;
        const { title, description, dueDate, priority, assignedTo, isTeamTask } = req.body;
        
    
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

            const tasks = await Task.find({ createdBy: user._id });
            if (!tasks) return res.status(404).json({ message: "No tasks Please Create a task" });
            
            res.json(tasks);

        }
    catch (error) {
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

