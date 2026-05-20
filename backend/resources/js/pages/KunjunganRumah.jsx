import React, { useState, useEffect } from 'react';
import api from '../api';
import { Camera, MapPin, Search, Calendar, FileText, CheckCircle, RefreshCcw, Home, Plus } from 'lucide-react';

const KunjunganRumah = () => {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    tanggal: '',
    nama_penerima: '',
    nik_penerima: '',
    ringkasan_kondisi: '',
    temuan_detail: '',
    rekomendasi: '',
    foto: null
  });
  
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const response = await api.get('/kunjungan-rumah');
      setLaporan(response.data);
    } catch (err) {
      console.error('Error fetching laporan kunjungan:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    try {
      await api.post('/kunjungan-rumah', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Laporan kunjungan berhasil disimpan');
      handleReset();
      fetchLaporan();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tanggal: '',
      nama_penerima: '',
      nik_penerima: '',
      ringkasan_kondisi: '',
      temuan_detail: '',
      rekomendasi: '',
      foto: null
    });
    setPreview(null);
    document.getElementById('foto_upload').value = '';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Home className="text-primary" /> Kunjungan Rumah
          </h1>
          <p className="page-subtitle">Catat laporan dan temuan kunjungan rumah</p>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--pk-glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText className="text-primary" size={20} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Formulir Kunjungan Rumah</h2>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Tanggal Kunjungan <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
                  <input 
                    type="date" 
                    className="form-control" 
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.75rem' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Penerima Manfaat <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Masukkan nama" 
                  name="nama_penerima"
                  value={formData.nama_penerima}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIK Penerima Manfaat</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Masukkan NIK" 
                  name="nik_penerima"
                  value={formData.nik_penerima}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Ringkasan Kondisi Tempat Tinggal <span style={{color: 'var(--pk-danger)'}}>*</span></label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="mis., Rumah buruk, sanitasi memadai" 
                name="ringkasan_kondisi"
                value={formData.ringkasan_kondisi}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Temuan Detail</label>
              <textarea 
                className="form-control" 
                placeholder="Jelaskan pengamatan detail dari kunjungan..." 
                name="temuan_detail"
                value={formData.temuan_detail}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Rekomendasi <span style={{color: 'var(--pk-danger)'}}>*</span></label>
              <textarea 
                className="form-control" 
                placeholder="Masukkan rekomendasi untuk bantuan..." 
                name="rekomendasi"
                value={formData.rekomendasi}
                onChange={handleInputChange}
                rows="3"
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Unggah Foto</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type="file" 
                    id="foto_upload"
                    className="form-control" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ paddingRight: '120px' }}
                  />
                  <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', display: 'flex', alignItems: 'center', padding: '0 1rem', background: 'var(--pk-surface)', borderLeft: '1px solid var(--pk-glass-border)', borderRadius: '0 8px 8px 0', pointerEvents: 'none', color: 'var(--pk-text-muted)' }}>
                    <Camera size={18} style={{ marginRight: '0.5rem' }} /> Pilih File
                  </div>
                </div>
                {preview && (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--pk-glass-border)' }}>
                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> {loading ? 'Menyimpan...' : 'Simpan Laporan Kunjungan'}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCcw size={18} /> Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--pk-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Riwayat Kunjungan</h2>
        </div>
        
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Penerima Manfaat</th>
                <th>Kondisi</th>
                <th>Rekomendasi</th>
                <th>Petugas</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length > 0 ? (
                laporan.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{item.nama_penerima}</div>
                      {item.nik_penerima && <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>NIK: {item.nik_penerima}</div>}
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.ringkasan_kondisi}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem', color: 'var(--pk-text-muted)' }}>
                        {item.rekomendasi}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--pk-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold' }}>
                          {item.petugas?.name?.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>{item.petugas?.name}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--pk-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={48} style={{ opacity: 0.2 }} />
                      <p>Belum ada riwayat kunjungan rumah.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KunjunganRumah;
