import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Eye } from 'lucide-react';

const PenerimaBantuan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nik: '', nama: '', alamat: '', wilayah: '', kondisi_ekonomi: '', jumlah_tanggungan: 0 });
  const [fotoKtp, setFotoKtp] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/penerima-bantuan');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--pk-bg-secondary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Pendaftaran Penerima Baru</h3>
            {formError && <p style={{ color: 'var(--pk-danger)', marginBottom: '1rem' }}>{formError}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">NIK (16 Digit)</label>
                <input className="form-control" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} required maxLength={16} />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-control" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat Lengkap</label>
                <textarea className="form-control" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} required rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Kondisi Ekonomi</label>
                  <input className="form-control" value={formData.kondisi_ekonomi} onChange={e => setFormData({...formData, kondisi_ekonomi: e.target.value})} required />
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
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Daftarkan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenerimaBantuan;
