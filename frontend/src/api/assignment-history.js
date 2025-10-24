import axios from './axios';

export const assignmentHistoryAPI = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await axios.get(`/api/v1/domains/history/all?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getByDomain: async (domainId) => {
    const response = await axios.get(`/api/v1/domains/history/${domainId}`);
    return response.data;
  },
};
