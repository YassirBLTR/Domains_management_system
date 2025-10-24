import axios from './axios';

// Providers are now just the company names (godaddy, namecheap, dynadot)
// They are read-only and managed by the system
export const providersAPI = {
  getAll: async () => {
    const response = await axios.get('/api/v1/providers/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/providers/${id}`);
    return response.data;
  },
};
