import axios from './axios';

export const domainsAPI = {
  getAll: async (status = null) => {
    const params = status ? { status } : {};
    const response = await axios.get('/api/v1/domains/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/api/v1/domains/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/api/v1/domains/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`/api/v1/domains/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/api/v1/domains/${id}`);
    return response.data;
  },

  assign: async (domainId, teamId = null, mailerId = null) => {
    const response = await axios.post('/api/v1/domains/assign', {
      domain_id: domainId,
      team_id: teamId,
      mailer_id: mailerId,
    });
    return response.data;
  },

  unassign: async (id) => {
    const response = await axios.post(`/api/v1/domains/${id}/unassign`);
    return response.data;
  },

  refreshDns: async (id) => {
    const response = await axios.post(`/api/v1/domains/${id}/refresh-dns`);
    return response.data;
  },

  refreshAllDns: async () => {
    const response = await axios.post('/api/v1/domains/refresh-all-dns');
    return response.data;
  },
};
