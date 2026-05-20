import api from './index';

const statusGiziService = {
  getAll: () => api.get('/status-gizi'),
  getStatistik: () => api.get('/status-gizi/statistik'),
  getHistoryPenerima: (id) => api.get(`/status-gizi/penerima/${id}`),
  store: (payload) => api.post('/status-gizi', payload),
  update: (id, payload) => api.put(`/status-gizi/${id}`, payload),
  delete: (id) => api.delete(`/status-gizi/${id}`),
};

export default statusGiziService;
