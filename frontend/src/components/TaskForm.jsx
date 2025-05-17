import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskForm = ({ teams , onSubmit, onCancel }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    isTeamTask: false
  });

  const handleChange = (e) => {
    const { name, value , type , checked } = e.target;
    setTaskData({
      ...taskData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate due date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (taskData.dueDate < today) {
      toast.error('Due date cannot be in the past!');
      return;
    }

    onSubmit(taskData);
    
    toast.success('Task created successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Title*</label>
        <input
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description*</label>
        <textarea
          name="description"
          value={taskData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          required
        />
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Due Date*</label>
        <input
          type="date"
          name="dueDate"
          value={taskData.dueDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]} // Disable past dates
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          name="priority"
          value={taskData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="isTeamTask"
          name="isTeamTask"
          checked={taskData.isTeamTask}
          onChange={handleChange}
        />
        <label htmlFor="isTeamTask">Team Task</label>
      </div>
      
      {taskData.isTeamTask && (
        <div className="form-group">
          <label>Assign To</label>
          <select
            name="assignedTo"
            value={taskData.assignedTo}
            onChange={handleChange}
          >
            <option value="">Select Team </option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;