import React, { useState } from 'react';
import { apiRequestTasks } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TaskDetail = ({ task, onClose, onTaskClose, onCommentSubmit }) => {
  const [comment, setComment] = useState('');
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  
  const getStatusText = (completed) => {
    return completed ? 'Completed' : 'Pending';
  };

  const getStatusColor = (completed) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      try {
        // Send the comment to the backend
        const response = await apiRequestTasks(`/comment/${task._id}`, 'POST', { comment });
        // Update the task with the new comment
        onCommentSubmit(response.data);
        // Clear the comment input
        setComment('');
        toast.success("Commented succesfully");
        window.location.reload();
        
        
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  const handleCloseTask = async() => {
    try {
      const response = await apiRequestTasks(`/close/${task._id}`, 'POST', { close });
      onTaskClose(task._id, response.data);
      toast.success("Task closed Successfully!");
    } catch (error) {
      console.error('Error closing task:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="p-3 bg-gray-50 rounded-md text-gray-700 min-h-20">
              {task.description || 'No description provided'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className={`px-3 py-2 rounded-md ${getStatusColor(task.status === 'completed')}`}>
                {getStatusText(task.status === 'completed')}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md">
                {task.isTeamTask ? 'Team Task' : 'Personal Task'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {task.comments && task.comments.length > 0 ? (
          
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              {task.comments.map((c, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-md">
                  <p className="text-sm text-gray-800">{c.comment || 'No comment text'}</p>
                  <p className="text-xs text-gray-500 text-right">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
                <p className="text-sm text-gray-500 italic">No comments yet.</p>
              )}  
 

          {/* Comment Section */}
          {task.status !== 'completed' && (
          <div className="space-y-1 mt-4">
            <label className="block text-sm font-medium text-gray-700">Add a Comment</label>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Write a comment..."
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCommentSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
          )}

          {/* Close Task Button */}
          {task.status !== 'completed' && (
            <div className="pt-4 flex justify-end space-x-4">
            <button 
              onClick={handleCloseTask}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Close Task
            </button>
            
          </div>
          )}
          <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>

          
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
