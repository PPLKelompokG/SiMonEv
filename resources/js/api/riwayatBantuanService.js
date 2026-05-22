import api from './index';

/**
 * PBI-19 – Riwayat & Histori Bantuan per Penerima
 * API service layer
 */

/**
 * Fetch the full chronological history for a specific recipient.
 *
 * @param {number|string} penerimaId
 * @param {object} params  - Optional query params:
 *   jenis      : 'penyaluran' | 'distribusi_pangan' | 'kunjungan_rumah' | 'perubahan_status'
 *   dari       : 'YYYY-MM-DD'
 *   sampai     : 'YYYY-MM-DD'
 *   per_page   : number (default 20, max 100)
 *   page       : number
 */
export const getHistoriBantuan = (penerimaId, params = {}) =>
  api.get(`/riwayat-bantuan/penerima/${penerimaId}`, { params });

/**
 * Fetch a quick summary (statistics + latest items) for a recipient.
 *
 * @param {number|string} penerimaId
 */
export const getRingkasanBantuan = (penerimaId) =>
  api.get(`/riwayat-bantuan/penerima/${penerimaId}/ringkasan`);

/**
 * Fetch list of penerima bantuan (for search / picker)
 *
 * @param {object} params - Optional: nama, nik, per_page, page
 */
export const getPenerimaBantuanList = (params = {}) =>
  api.get('/penerima-bantuan', { params });
