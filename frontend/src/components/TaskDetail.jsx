import React, { useState, useEffect, useRef } from 'react';
import { apiRequestTasks } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiX, FiCalendar, FiFlag, FiCheckCircle, FiUser, FiClock, FiPaperclip, FiDownload, FiMessageSquare, FiSend, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from './ConfirmModal';
import axios from 'axios';

const TaskDetail = ({ task, onClose, onTaskClose }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const priorityConfig = {
    high: { color: 'bg-red-500/10 text-red-600', icon: '🔥' },
    medium: { color: 'bg-amber-500/10 text-amber-600', icon: '⚠️' },
    low: { color: 'bg-emerald-500/10 text-emerald-600', icon: '🌿' }
  };

  const statusConfig = {
    completed: { color: 'bg-green-500/10 text-green-600', text: 'Completed' },
    pending: { color: 'bg-blue-500/10 text-blue-600', text: 'Pending' }
  };

  // Fetch comments when task changes
  useEffect(() => {
    if (task.isTeamTask) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    try {
      const response = await apiRequestTasks(`/${task._id}/comments`, 'GET',{});
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if ((!newComment.trim() && !selectedFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('content', newComment);
      if (selectedFile) {
        formData.append('files', selectedFile);
      }

      const response = await axios.post(
        `http://localhost:5000/api/tasks/${task._id}/comments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setComments([...comments, {
          ...response.data,
          user: {
            _id: user.id,
            fullname: user.fullname
          }
        }]);
        setNewComment('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success("Comment added!");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteComment = async () => {
    try {
      await apiRequestTasks(`/${task._id}/comments/${commentToDelete}`, 'DELETE', {});
      setComments(comments.filter(comment => comment._id !== commentToDelete));
      toast.success("Comment deleted!");
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError("Failed to delete comment");
      toast.error("Failed to delete comment");
    } finally {
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const canDeleteComment = (comment) => {
    // Allow deletion if user is the comment author OR the task creator
    return comment.user._id === user.id || task.createdBy._id === user.id;
  };

  const handleCloseTask = async () => {
    try {
      const response = await apiRequestTasks(`/close/${task._id}`, 'POST', {});
      onTaskClose(task._id, response.data);
      toast.success("Task marked as completed!");
    } catch (error) {
      toast.error("Failed to complete task");
      console.error('Error closing task:', error);
    }
  };

  const handleDownloadAttachment = (attachmentUrl) => {
    window.open(attachmentUrl, '_blank');
  };

  const openDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-2 max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Title and Priority */}
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-semibold text-gray-800 leading-tight">{task.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${priorityConfig[task.priority]?.color || 'bg-gray-100 text-gray-600'}`}>
              {priorityConfig[task.priority]?.icon} {task.priority}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span>Description</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed">
              {task.description || (
                <span className="text-gray-400 italic">No description provided</span>
              )}
            </div>
          </div>

          {/* Attachments */}
          {task.files && task.files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiPaperclip className="h-4 w-4" />
                <span>Attachments ({task.files.length})</span>
              </div>
              <div className="space-y-2">
                {task.files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleDownloadAttachment(`http://localhost:5000/${file.path}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FiPaperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                        {file.filename || `Attachment ${index + 1}`}
                      </span>
                    </div>
                    <FiDownload className="h-4 w-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiCheckCircle className="h-4 w-4" />
                <span>Status</span>
              </div>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[task.status === 'completed' ? 'completed' : 'pending'].color}`}>
                {statusConfig[task.status === 'completed' ? 'completed' : 'pending'].text}
              </div>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiUser className="h-4 w-4" />
                <span>Type</span>
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                {task.isTeamTask ? 'Team Task' : 'Personal'}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiCalendar className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'No due date'}
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiClock className="h-4 w-4" />
                <span>Created</span>
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium">
                {new Date(task.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Comments Section - Only for team tasks */}
          {task.isTeamTask && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <FiMessageSquare className="h-4 w-4" />
                <span>Comments ({comments.length})</span>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 group">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {comment?.user?.fullname?.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{comment.user.fullname}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          {comment.files &&  comment.files.length > 0 && (
                            <div 
                              className="mt-2 flex items-center justify-between p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                              onClick={() => handleDownloadAttachment(`http://localhost:5000/${comment.files[0].path}`)}
                            >
                              <div className="flex items-center gap-2">
                                <FiPaperclip className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                                  {comment.files[0].originalname || 'Attachment'}
                                </span>
                              </div>
                              <FiDownload className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => openDeleteModal(comment._id)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="Delete comment"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No comments yet</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 pt-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                    {user?.fullname?.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <label className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="*"
                      />
                      <FiPaperclip className="h-4 w-4" />
                    </label>
                    <button
                      onClick={handleAddComment}
                      disabled={(!newComment.trim() && !selectedFile) || isSubmitting}
                      className="p-2 rounded-full bg-blue-500 text-white disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiPaperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {task.status !== 'completed' && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            {task.createdBy._id === user.id && (
              <button 
                onClick={handleCloseTask}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="h-4 w-4" />
                Mark as Complete
              </button>
            )}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
          setError("");
        }}
        onConfirm={handleDeleteComment}
        message="Are you sure you want to delete this comment? This action cannot be undone."
        error={error}
      />
    </div>
  );
};

export default TaskDetail;