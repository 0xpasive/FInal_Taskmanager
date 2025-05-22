const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Comments = mongoose.model('Comments', commentSchema);
module.exports = Comments ;