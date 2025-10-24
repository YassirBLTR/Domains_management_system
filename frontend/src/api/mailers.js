import axios from './axios';

export const mailersAPI = {
  getAll: async () => {
    const response = await axios.get('/api/v1/mailers/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/mailers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/v1/mailers/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/v1/mailers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/v1/mailers/${id}`);
    return response.data;
  },
};
