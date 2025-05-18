import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import TaskView from '../components/TaskView';
import TeamView from '../components/TeamView';
import TaskForm from '../components/TaskForm';
import ProfileButton from '../components/ProfileButton';
import { apiRequest, apiRequestTasks } from '../utils/api';
import { teamAPI } from '../utils/apiTeam';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const data = await teamAPI.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, tasksResponse] = await Promise.all([
          apiRequest('/user', 'GET'),
          apiRequestTasks('/myTasks', 'GET'),
        ]);
        
        setUser(userResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    fetchTeams();
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
    const prevTasks = [...tasks];
    setTasks(tasks.filter(task => task._id !== taskId));
    
    try {
      await apiRequestTasks(`/delete/${taskId}`, 'DELETE', {taskId});
      toast.success("Task deleted successfully");
    } catch (error) {
      setTasks(prevTasks);
      toast.error(error.response?.data?.message || "Failed to delete task");
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
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow-sm">
        <div className="w-full sm:w-auto flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Task Manager</div>
          
          {/* Mobile menu button */}
          <button 
            className="sm:hidden p-2 text-gray-600"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-4">
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
          
          
          
          <ProfileButton user={user} onClick={() => navigate('/profile')} />
        </div>
        
        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="sm:hidden w-full mt-4 space-y-2">
            <button 
              className={`w-full text-left px-4 py-2 rounded-md ${activeView === 'tasks' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => {
                setActiveView('tasks');
                setShowMobileMenu(false);
              }}
            >
              Tasks
            </button>
            
            <button 
              className={`w-full text-left px-4 py-2 rounded-md ${activeView === 'team' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => {
                setActiveView('team');
                setShowMobileMenu(false);
              }}
            >
              My Team
            </button>
            
            <button 
              className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                setShowTaskForm(true);
                setShowMobileMenu(false);
              }}
            >
              Create Task
            </button>
            
            <div className="flex  justify-between px-4 py-2">
              
              
              <ProfileButton user={user} onClick={() => {
                navigate('/profile');
                setShowMobileMenu(false);
              }} />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
              teams={teams}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;