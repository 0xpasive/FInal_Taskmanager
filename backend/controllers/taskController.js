const Task = require("../models/Task");
const User = require("../models/User");
const express = require("express");
const Team = require('../models/Team');
const Comments = require('../models/Comments')

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
        const userId = req.user._id; // More concise

        // First verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Then check authorization
        if (!task.createdBy.equals(userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this task' 
            });
        }

        // Perform deletion
        await Task.findByIdAndDelete(taskId);

        // Return success response
        return res.status(200).json({ 
            message: 'Task deleted successfully',
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

// const commentOnTask = async (req, res) => {
//     try {
//         const { taskId } = req.params;
//         const { comment } = req.body;
//         const user = req.user;

//         if (!comment || !comment.trim()) {
//             return res.status(400).json({ message: 'Comment is required' });
//         }

//         const updatedTask = await Task.findByIdAndUpdate(
//             taskId,
//             { $push: { comments: { comment: comment.trim(), createdAt: new Date(), createdBy: user._id } } },
//             { new: true }
//         );

//         if (!updatedTask) {
//             return res.status(404).json({ message: 'Task not found' });
//         }

//         res.json(updatedTask);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error commenting on task' });
//     }
// };
// const deleteComment = async (req,res) => {
//     const taskId = req.params.taskId;
//     const commentId = req.params.commentId;
//     try {
//     const task = await Task.findById(req.params.taskId);
    
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Find the comment index
//     const commentIndex = task.comments.findIndex(
//       comment => comment._id.toString() === req.params.commentId
//     );

//     if (commentIndex === -1) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }

//     // Check if user is the comment creator or task owner
    
    

//     // Remove the comment
//     task.comments.splice(commentIndex, 1);
//     await task.save();

//     res.json({ message: 'Comment deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
    
// };

const addComments = async (req, res) => {
  try {
    const user = req.user;
    const { content } = req.body;
    const {taskId} = req.params;

    const comment = new Comments({
      content: content,
      task: taskId,
      user: user._id
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


    




module.exports = {
    CreateTask,
    getUserTasks,
    updateTask,
    deleteTask,
    closeTask,
    addComments,
    getComments
    // commentOnTask,
    // deleteComment
};

