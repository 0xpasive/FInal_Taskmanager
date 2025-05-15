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
        const response = await apiRequestTasks(`/comment/${task._id}`, 'POST', { comment });
        onCommentSubmit(response.data);
        setComment('');
        toast.success("Commented successfully");
        window.location.reload();
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
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
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md mx-2 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Task Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto pr-2 flex-1 space-y-3 md:space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base md:text-lg font-medium text-gray-800">{task.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="p-2 md:p-3 bg-gray-50 rounded-md text-gray-700 min-h-20 text-sm md:text-base">
              {task.description || 'No description provided'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className={`px-2 py-1 md:px-3 md:py-2 rounded-md text-sm ${getStatusColor(task.status === 'completed')}`}>
                {getStatusText(task.status === 'completed')}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="px-2 py-1 md:px-3 md:py-2 bg-gray-50 rounded-md text-sm">
                {task.isTeamTask ? 'Team Task' : 'Personal Task'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <div className="px-2 py-1 md:px-3 md:py-2 bg-gray-50 rounded-md text-sm">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <div className="px-2 py-1 md:px-3 md:py-2 bg-gray-50 rounded-md text-sm">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {task.comments && task.comments.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              {task.comments.map((c, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-md text-sm mb-2">
                  <p className="text-gray-800">{c.comment || 'No comment text'}</p>
                  <p className="text-xs text-gray-500 text-right">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet.</p>
          )}
        </div>

        {task.status !== 'completed' && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="space-y-1">
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={handleCommentChange}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="2"
                  placeholder="Write a comment..."
                ></textarea>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className={`absolute right-2 bottom-2 p-1 rounded-full ${comment.trim() ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleCloseTask}
                  className="px-3 py-1 md:px-4 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Close Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;