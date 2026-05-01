import api from './index';

const kiaService = {
  // ── Ibu Hamil ──────────────────────────────────────
  ibuHamil: {
    getAll:          ()        => api.get('/kia/ibu-hamil'),
    getStatistik:    ()        => api.get('/kia/ibu-hamil/statistik'),
    getHistoryByPenerima: (id) => api.get(`/kia/ibu-hamil/penerima/${id}`),
    store:           (payload) => api.post('/kia/ibu-hamil', payload),
    update:          (id, payload) => api.put(`/kia/ibu-hamil/${id}`, payload),
    delete:          (id)      => api.delete(`/kia/ibu-hamil/${id}`),
  },

  // ── Balita ──────────────────────────────────────────
  balita: {
    getAll:          ()        => api.get('/kia/balita'),
    getStatistik:    ()        => api.get('/kia/balita/statistik'),
    getHistoryByPenerima: (id) => api.get(`/kia/balita/penerima/${id}`),
    store:           (payload) => api.post('/kia/balita', payload),
    update:          (id, payload) => api.put(`/kia/balita/${id}`, payload),
    delete:          (id)      => api.delete(`/kia/balita/${id}`),
  },
};

export default kiaService;
