import axios from 'axios';

const API_URL = 'http://localhost:8000/api/program-bantuan';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };
};

export const programBantuanService = {
  getAll: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  }
};
