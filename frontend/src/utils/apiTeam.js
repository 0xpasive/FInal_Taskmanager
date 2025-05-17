import axios from 'axios';


const API_BASE_URL = "http://localhost:5000/api/teams";

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const teamAPI = {
  // Get all teams for the current user
  getTeams: async () => {
    const response = await api.get('/myTeams');
    return response.data;
  },

  // Create a new team
  createTeam: async (teamName) => {
    const response = await api.post('/create', { name: teamName });
    return response.data;
  },

  // Add member to a team
  addMember: async (teamId, email) => {
    const response = await api.post(`/add/${teamId}`, { email });
    return response.data;
  },

  // Remove member from a team
  removeMember: async (teamId, userId) => {
    const response = await api.post(`/remove/${teamId}`, { userId });
    return response.data;
  },

  // Get all available users (for adding members)
  getAvailableUsers: async () => {
    const response = await api.post('/users');
    return response.data;
  },

  deleteTeam: async (teamId) => {
    const response = await api.post(`/delete/${teamId}`);
    return response.data;
  },
  getInvitations: async () => {
  const response = await api.get('/invitations');
  return response.data;
  } ,
  
  acceptInvitation: async (teamId) => {
    const response = await api.post('/accept', {teamId});
    return response.data;
    
  },
  declineInvitation: async (teamId) => {
    const response = await api.post('/reject', {teamId});
    return response.data;
    
  },

  // Optional: Add method to set token directly
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
};