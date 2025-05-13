import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { FiLogOut } from 'react-icons/fi';



const Profile = () => {
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/user', 'GET');
        setUser(response.data);
      } catch (error) {
        setMessage({ text: 'Failed to fetch user data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await apiRequest('/user/change-password', 'PUT', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setMessage({ 
        text: 'Password changed successfully. You will be logged out in 3 seconds...', 
        type: 'success' 
      });
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Logout after 3 seconds
      setTimeout(() => {
        handleLogout();
      }, 3000);

    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Password change failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
  <button
    onClick={() => navigate(-1)}
    className="text-blue-600 hover:underline"
  >
    ← Back
  </button>
  <button
    onClick={handleLogout}
    className="text-red-600 hover:text-red-800"
    title="Logout"
  >
    <FiLogOut size={24} />
  </button>
</div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h2>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-gray-800">{user.fullname}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Organization</p>
            <p className="text-gray-800">{user.organization}</p>
          </div>
          <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-800">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
      </div>

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength="6"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength="6"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
      
        
      

    </div>
  );
};

export default Profile;