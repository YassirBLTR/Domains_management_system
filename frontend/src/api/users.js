import axios from './axios';

export const usersAPI = {
  getAll: async () => {
    const response = await axios.get('/api/v1/users/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/v1/users/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/v1/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};
