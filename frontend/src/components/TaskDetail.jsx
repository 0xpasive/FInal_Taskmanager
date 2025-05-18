import React from 'react';
import { apiRequestTasks } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskDetail = ({ task, onClose, onTaskClose }) => {
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
        </div>

        {task.status !== 'completed' && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button 
                onClick={handleCloseTask}
                className="px-3 py-1 md:px-4 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Close Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;