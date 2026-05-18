import api from './index';

/**
 * Ambil semua notifikasi milik user yang login (paginated).
 * @param {number} perPage - Jumlah item per halaman (default 20, max 100)
 */
export const getNotifikasi = (perPage = 20) =>
  api.get('/notifikasi', { params: { per_page: perPage } });

/**
 * Ambil jumlah notifikasi yang belum dibaca.
 */
export const getUnreadCount = () =>
  api.get('/notifikasi/unread-count');

/**
 * Tandai satu notifikasi sebagai sudah dibaca.
 * @param {string} id - UUID notifikasi
 */
export const markAsRead = (id) =>
  api.post(`/notifikasi/${id}/read`);

/**
 * Tandai semua notifikasi sebagai sudah dibaca.
 */
export const markAllAsRead = () =>
  api.post('/notifikasi/read-all');

/**
 * Hapus satu notifikasi.
 * @param {string} id - UUID notifikasi
 */
export const deleteNotifikasi = (id) =>
  api.delete(`/notifikasi/${id}`);
