import React, { useState } from 'react';
import TaskDetail from './TaskDetail';
import TaskEditForm from './TaskEditForm';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskView = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null); // Added to track which task to delete

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'team') return task.isTeamTask;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      // Handle undefined due dates by putting them at the end
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveTask = (updatedTask) => {
    onTaskUpdate(updatedTask._id, updatedTask);
    setEditingTask(null);
  };

  const handleTaskClose = async (taskId, updatedTask) => {
    onTaskUpdate(taskId, updatedTask);
    setSelectedTask(null);
  };

  // const handleCommentSubmit = async (updatedTask) => {
  //   onTaskUpdate(updatedTask._id, updatedTask);
  // };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onTaskDelete(taskToDelete._id);
      
    }
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="team">Team Tasks</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <div 
              key={task._id} 
              className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${
                task.status === "completed" ? 'border-green-500' : 'border-blue-500'
              }`} 
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {task.status === 'completed' && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-green-500" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                    <h3 
                      className={`font-medium ${
                        task.status === 'completed' ? 'text-gray-500' : 'text-gray-800'
                      } cursor-pointer`} 
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 max-h-24 overflow-auto">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setEditingTask(task)}
                    className="p-1 text-gray-400 hover:text-blue-500"
                    title="Edit task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteClick(task)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {task.dueDate && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {task.assignedTo && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onTaskClose={handleTaskClose}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
      
      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditForm 
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={() => setEditingTask(null)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={taskToDelete ? `Are you sure you want to delete "${taskToDelete.title}" permanently? This action cannot be undone.` : ''}
      />
    </div>
  );
};

export default TaskView;