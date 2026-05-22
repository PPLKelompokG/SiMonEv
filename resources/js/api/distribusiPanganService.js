import api from './index';

const distribusiPanganService = {
  getAll: async (params) => {
    return await api.get('/distribusi-pangan', { params });
  },
  
  getStatistik: async () => {
    return await api.get('/distribusi-pangan/statistik');
  },
  
  getKomoditas: async () => {
    return await api.get('/distribusi-pangan/komoditas');
  },
  
  getPenerimaDisetujui: async () => {
    return await api.get('/distribusi-pangan/penerima-disetujui');
  },
  
  getHistoryPenerima: async (id) => {
    return await api.get(`/distribusi-pangan/penerima/${id}`);
  },
  
  getById: async (id) => {
    return await api.get(`/distribusi-pangan/${id}`);
  },
  
  create: async (data) => {
    return await api.post('/distribusi-pangan', data);
  },
  
  update: async (id, data) => {
    return await api.put(`/distribusi-pangan/${id}`, data);
  },
  
  delete: async (id) => {
    return await api.delete(`/distribusi-pangan/${id}`);
  }
};

export default distribusiPanganService;
