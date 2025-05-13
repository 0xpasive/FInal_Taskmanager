import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import Notifications from '../components/Notification';
import TaskView from '../components/TaskView';
import TeamView from '../components/TeamView';
import TaskForm from '../components/TaskForm';
import ProfileButton from '../components/ProfileButton';
import { apiRequest, apiRequestTasks } from '../utils/api';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, tasksResponse] = await Promise.all([
          apiRequest('/user', 'GET'),
          apiRequestTasks('/myTasks', 'GET'),
          
          // apiRequest('/notifications', 'GET'),
        ]);
        
        setUser(userResponse.data);
        setTasks(tasksResponse.data);
        
        // setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await apiRequestTasks('/create', 'POST', taskData);
      setTasks([...tasks, response.data]);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  
  

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const response = await apiRequestTasks(`/update/${taskId}`, 'POST', updates);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await apiRequestTasks(`/delete/${taskId}`, 'DELETE' , { taskId });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await apiRequest(`/notifications/mark-read/${notificationId}`, 'PATCH');
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="text-xl font-bold text-blue-600">Task Manager</div>
        
        <div className="flex items-center space-x-4">
          <button 
            className={`px-4 py-2 rounded-md ${activeView === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveView('tasks')}
          >
            Tasks
          </button>
          
          <button 
            className={`px-4 py-2 rounded-md ${activeView === 'team' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveView('team')}
          >
            My Team
          </button>
          
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setShowTaskForm(true)}
          >
            Create Task
          </button>
          
          <div className="relative">
            <button 
              className="p-2 text-gray-600 hover:text-blue-500 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <Notifications
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          
          <ProfileButton user={user} onClick={() => navigate('/profile')} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeView === 'tasks' && (
          <TaskView
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        )}
        {activeView === 'team' && (
          <TeamView />
        )}
        
        
      </main>

      {/* Task Creation Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
              
              
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;