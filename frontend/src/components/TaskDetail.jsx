import React, { useState } from 'react';
import { apiRequestTasks } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskDetail = ({ task, onClose, onTaskClose, onCommentSubmit }) => {
  const [comment, setComment] = useState('');
  const user = JSON.parse(localStorage.getItem("user"));
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

  const handleDeleteComment = async (commentId) => {
    try {
      await apiRequestTasks(`/comment/${task._id}/${commentId}`, 'POST', {commentId});
      toast.success("Comment deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  // Format date to Facebook-style (e.g., "2 hrs ago", "Yesterday", "May 15 at 3:30 PM")
  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options).replace(',', ' at');
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
            <div className="space-y-3 mt-4">
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                {task.comments.map((c, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {user?.avatar ? (
        <img src={user.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="font-medium">
          {c.createdBy.fullname.split(' ').map(n => n[0]).join('')}
        </span>
      )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 p-3 rounded-2xl">
                        <div className="flex justify-between items-baseline">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm text-gray-900">
                              {c.createdBy.fullname || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCommentDate(c.createdAt)}
                            </span>
                          </div>
                          {user && c.createdBy._id === user.id && (
    <button 
      onClick={() => handleDeleteComment(c._id)}
      className="text-xs text-red-500 hover:text-red-700"
      title="Delete comment"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>)}
                        </div>
                        <p className="text-gray-800 text-sm mt-1">
                          {c.comment || 'No comment text'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet.</p>
          )}
        </div>

        {task.status !== 'completed' && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="space-y-1">
              <div className="relative">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {user?.avatar ? (
        <img src={user.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="font-medium">
          {user?.fullname?.split(' ').map(n => n[0]).join('')}
        </span>
      )}
                      
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={comment}
                      onChange={handleCommentChange}
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                </div>
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