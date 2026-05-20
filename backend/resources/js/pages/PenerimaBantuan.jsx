import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Eye, X, MapPin, Search, Filter, Download } from 'lucide-react';

const WILAYAH_LIST = [
  'Batujajar', 'Cihampelas', 'Cikalongwetan', 'Cililin', 
  'Cipatat', 'Cipeundeuy', 'Cipongkor', 'Cisarua', 
  'Gununghalu', 'Lembang', 'Ngamprah', 'Padalarang', 
  'Parongpong', 'Rongga', 'Saguling', 'Sindangkerta'
];

const KONDISI_EKONOMI_LIST = [
  { value: 'sangat_miskin', label: 'Sangat Miskin' },
  { value: 'miskin', label: 'Miskin' },
  { value: 'rentan_miskin', label: 'Rentan Miskin' },
];

const PenerimaBantuan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nik: '', nama: '', alamat: '', wilayah: '', kondisi_ekonomi: '', jumlah_tanggungan: 0 });
  const [fotoKtp, setFotoKtp] = useState(null);
  const [formError, setFormError] = useState('');

  const [filters, setFilters] = useState({ search: '', wilayah: '', status: '', program_id: '' });
  const [programs, setPrograms] = useState([]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/program-bantuan');
      setPrograms(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch programs', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.wilayah) params.append('wilayah', filters.wilayah);
      if (filters.status) params.append('status', filters.status);
      if (filters.program_id) params.append('program_id', filters.program_id);

      const res = await api.get(`/penerima-bantuan?${params.toString()}`);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchData();
  }, []); // Initial load

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.wilayah) params.append('wilayah', filters.wilayah);
      if (filters.status) params.append('status', filters.status);
      if (filters.program_id) params.append('program_id', filters.program_id);

      const res = await api.get(`/penerima-bantuan/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_penerima_bantuan_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Export failed', e);
      alert('Gagal mengekspor data.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      if (fotoKtp) payload.append('foto_ktp', fotoKtp);

      await api.post('/penerima-bantuan', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error mendaftar');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Penerima Bantuan</h2>
          <p>Daftar calon atau penerima bantuan yang telah diregistrasi</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ nik: '', nama: '', alamat: '', wilayah: '', kondisi_ekonomi: '', jumlah_tanggungan: 0 }); setShowModal(true); }}>
          <Plus size={18} /> Pendaftaran Baru
        </button>
      </div>

      {/* Filter Section */}
      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--pk-text)' }}>Pencarian & Filter Data</h4>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Cari Nama/NIK</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--pk-muted)' }}>
                <Search size={16} />
              </div>
              <input type="text" className="form-control" placeholder="Masukkan kata kunci..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Wilayah</label>
            <select className="form-control" value={filters.wilayah} onChange={e => setFilters({...filters, wilayah: e.target.value})}>
              <option value="">Semua Wilayah</option>
              {WILAYAH_LIST.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Status</label>
            <select className="form-control" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">Semua Status</option>
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="lulus">Lulus (Graduasi)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>Program Bantuan</label>
            <select className="form-control" value={filters.program_id} onChange={e => setFilters({...filters, program_id: e.target.value})}>
              <option value="">Semua Program</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.nama_program}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={fetchData} style={{ flex: 1, padding: '0.75rem' }}>
              <Filter size={16} /> Terapkan
            </button>
            <button className="btn btn-outline" onClick={handleExport} style={{ flex: 1, padding: '0.75rem' }}>
              <Download size={16} /> Ekspor
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama Lengkap</th>
                  <th>Wilayah</th>
                  <th>Status</th>
                  <th>Pendaftar</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>{item.nik}</td>
                    <td>{item.nama}</td>
                    <td>{item.wilayah || '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 'disetujui' ? 'badge-success' : item.status === 'ditolak' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.creator?.name || '-'}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign:'center' }}>Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--pk-text)', fontWeight: 700 }}>Pendaftaran Penerima Baru</h3>
            {formError && <p style={{ color: 'var(--pk-danger)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{formError}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">NIK (16 Digit)</label>
                <input type="number" className="form-control" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} required />
                {formData.nik.length > 16 && (
                  <small style={{ color: 'var(--pk-danger)', display: 'block', marginTop: '0.25rem' }}>NIK hanya 16 digit saja.</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-control" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat Lengkap</label>
                <textarea className="form-control" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} required rows={3}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label"><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />Wilayah (Kecamatan)</label>
                <select className="form-control" value={formData.wilayah} onChange={e => setFormData({...formData, wilayah: e.target.value})} required>
                  <option value="">Pilih Wilayah</option>
                  {WILAYAH_LIST.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Kondisi Ekonomi</label>
                  <select className="form-control" value={formData.kondisi_ekonomi} onChange={e => setFormData({...formData, kondisi_ekonomi: e.target.value})} required>
                    <option value="">Pilih Kondisi</option>
                    {KONDISI_EKONOMI_LIST.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Tanggungan</label>
                  <input type="number" className="form-control" value={formData.jumlah_tanggungan} onChange={e => setFormData({...formData, jumlah_tanggungan: e.target.value})} required min={0} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Foto KTP (Opsional, JPG/PNG)</label>
                <input type="file" className="form-control" onChange={e => setFotoKtp(e.target.files[0])} accept="image/*" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenerimaBantuan;
