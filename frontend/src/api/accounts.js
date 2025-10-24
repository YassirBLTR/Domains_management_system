import axios from './axios';

export const accountsAPI = {
  getAll: async () => {
    const response = await axios.get('/api/v1/accounts/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/accounts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/v1/accounts/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/v1/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/v1/accounts/${id}`);
    return response.data;
  },

  testConnection: async (id) => {
    const response = await axios.get(`/api/v1/sync/accounts/test-connection/${id}`);
    return response.data;
  },

  syncDomains: async (id) => {
    const response = await axios.post(`/api/v1/sync/domains/sync/${id}`);
    return response.data;
  },
};
