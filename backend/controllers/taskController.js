const Task = require("../models/Task");
const User = require("../models/User");
const express = require("express");
const Team = require('../models/Team');
const Comments = require('../models/Comments')
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const CreateTask = async (req, res) => {
    try {
        const user = req.user;
        let { title, description, dueDate, priority, assignedTo, isTeamTask } = req.body;
        
        if (!isTeamTask) {
            assignedTo = null;
        }

        // Handle file uploads for all tasks
        let files = [];
        if (req.files) {
            files = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }
        
        // Create a new task instance
        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            assignedTo,
            isTeamTask,
            createdBy: user._id,
            files
        });
    
        // Save the task to the database
        const savedTask = await newTask.save();
    
        res.status(201).json(savedTask);
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating task' });
    }
};

//get task of the user based on provided bearer token
const getUserTasks = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get teams where the user is a member (including teams they created)
        const teams = await Team.find({
            $or: [
                { 'members.user': userId }, // User is a member
                { createdBy: userId }      // User created the team
            ]
        }).select('_id'); // Only get team IDs
        
        const teamIds = teams.map(team => team._id);

        // Find tasks:
        // - Personal tasks created by the user
        // OR
        // - Team tasks assigned to user's teams
        const tasks = await Task.find({
            $or: [
                { createdBy: userId, isTeamTask: false }, // Personal tasks
                { 
                    isTeamTask: true,
                    assignedTo: { $in: teamIds }           // Team tasks
                }
            ]
        })
        .populate('assignedTo') // Fixed typo (removed space)
        .populate('createdBy', 'username email') // Add more useful population
        .sort({ dueDate: 1, priority: -1 }); // Sort by due date (asc) and priority (high first)

        res.json(tasks);

    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Could not fetch tasks' 
        });
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
        const userId = req.user._id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.createdBy.equals(userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this task' 
            });
        }

        // Delete associated files using file.path
        if (task.files && task.files.length > 0) {
            task.files.forEach(file => {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlink(file.path, err => {
                        if (err) console.error(`Failed to delete file at ${file.path}`, err);
                    });
                }
            });
        }

        // Delete the task from DB
        await Task.findByIdAndDelete(taskId);

        return res.status(200).json({ 
            message: 'Task and files deleted successfully',
            deletedTaskId: taskId 
        });

    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to delete task' 
        });
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



const addComments = async (req, res) => {
  try {
    const user = req.user;
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const {taskId} = req.params;
    let files = [];
        if (req.files) {
            files = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

    const comment = new Comments({
      content: content,
      task: taskId,
      user: user._id,
      files: files
    });

    await comment.save();

    const populatedComment = await Comments.findById(comment._id).populate('user', 'fullname');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.params;

    const comments = await Comments.find({ task: taskId }).populate('user', 'fullname');

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const user = req.user;

    // Find the comment
    const comment = await Comments.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    //Delete files associated with the comment
    if (comment.files && comment.files.length > 0) {
      comment.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlink(file.path, err => {
            if (err) console.error(`Failed to delete file at ${file.path}`, err);
          });
        }
      });
    }
    

    // Delete the comment
    await Comments.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


    




module.exports = {
    CreateTask,
    getUserTasks,
    updateTask,
    deleteTask,
    closeTask,
    addComments,
    getComments,
    // commentOnTask,
    deleteComment
};

