import api from './index';

export const programBantuanService = {
  getAll: async () => {
    const response = await api.get('/program-bantuan');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/program-bantuan/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/program-bantuan', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/program-bantuan/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/program-bantuan/${id}`);
    return response.data;
  }
};
