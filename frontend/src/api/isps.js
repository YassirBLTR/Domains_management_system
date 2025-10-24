import axios from './axios';

export const ispsAPI = {
  getAll: async () => {
    const response = await axios.get('/api/v1/isps/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/isps/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/v1/isps/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/v1/isps/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/v1/isps/${id}`);
    return response.data;
  },
};
