import axios from 'axios';

const BASE_URL = "http://localhost:5000/api/auth";

export const apiRequest = (endpoint, method , data = null) => {
  const token = localStorage.getItem('token');

  return axios({
    method,
    url: `${BASE_URL}${endpoint}`,
    data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

const ANOTHER_BASE_URL = "http://localhost:5000/api/tasks";
export const apiRequestTasks = (endpoint, method , data = null) => {
  const token = localStorage.getItem('token');

 


  return axios({
    method,
    url: `${ANOTHER_BASE_URL}${endpoint}`,
    data,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};


