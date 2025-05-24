import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskForm = ({ teams, onSubmit, onCancel }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    isTeamTask: false,
  });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskData({
      ...taskData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

      const addFiles = useCallback((newFiles) => {
        // Filter out duplicates and invalid files
        const uniqueNewFiles = newFiles.filter(newFile => 
          !files.some(existingFile => 
            existingFile.name === newFile.name && existingFile.size === newFile.size
          )
        );

        if (uniqueNewFiles.length === 0) {
          toast.warn('Some files were duplicates and not added');
          return;
        }

        // Check if adding these files would exceed the limit
        const totalFilesAfterAdd = files.length + uniqueNewFiles.length;
        if (totalFilesAfterAdd > 2) {
          toast.error('You can only upload a maximum of 2 files');
          return;
        }

        setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
      }, [files]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate due date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (taskData.dueDate < today) {
      toast.error('Due date cannot be in the past!');
      return;
    }

    // Validate at least title and description
    if (!taskData.title.trim() || !taskData.description.trim()) {
      toast.error('Title and description are required!');
      return;
    }

    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Append all task data
    Object.entries(taskData).forEach(([key, value]) => {
      if (key === 'assignedTo' && !taskData.isTeamTask) {
      return;
      }
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });

    onSubmit(formData);
  };

  const user = JSON.parse(localStorage.getItem("user"));

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
          min={new Date().toISOString().split('T')[0]}
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

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Attachments</label>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">
              {isDragging ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm"
            >
              Select Files
            </label>
            <p className="text-xs text-gray-500">Supports up to 2 files (Max 10MB each)</p>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Selected files ({files.length})</h3>
            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 inline-flex items-center justify-center rounded-full h-8 w-8 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id="isTeamTask"
          name="isTeamTask"
          checked={taskData.isTeamTask}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isTeamTask" className="ml-2 block text-sm text-gray-700">Team Task</label>
      </div>
      
      {taskData.isTeamTask && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Assign To Team</label>
          <select
            name="assignedTo"
            value={taskData.assignedTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Team</option>
            {teams
              .filter(team => team.createdBy._id === user.id)
              .map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))
            }
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={!taskData.title.trim() || !taskData.description.trim()}
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;