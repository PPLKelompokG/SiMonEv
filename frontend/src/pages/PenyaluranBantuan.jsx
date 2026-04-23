import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, Search, Plus, FileText, CheckCircle, AlertCircle, FolderOpen, Calendar, DollarSign, Tag, User } from 'lucide-react';

const PenyaluranBantuan = () => {
  const [penyaluranList, setPenyaluranList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    penerima_bantuan_id: '',
    program_bantuan_id: '',
    tanggal_penyaluran: '',
    jenis_bantuan: '',
    jumlah_bantuan: '',
    keterangan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch history penyaluran
      const resPenyaluran = await api.get('/penyaluran-bantuan');
      setPenyaluranList(resPenyaluran.data.data);

      // Fetch approved penerima
      const resPenerima = await api.get('/penyaluran-bantuan/penerima-disetujui');
      setPenerimaList(resPenerima.data.data);

      // Fetch program bantuan
      try {
        const resProgram = await api.get('/program-bantuan');
        setProgramList(resProgram.data.data);
      } catch (e) {
        console.log("Program bantuan tidak tersedia", e);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Pastikan koneksi ke server baik.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/penyaluran-bantuan', formData);
      setMessage('Penyaluran bantuan berhasil dicatat.');
      setFormData({
        penerima_bantuan_id: '',
        program_bantuan_id: '',
        tanggal_penyaluran: '',
        jenis_bantuan: '',
        jumlah_bantuan: '',
        keterangan: ''
      });
      fetchData(); // Refresh list
      
      // Auto hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Terjadi kesalahan saat menyimpan data.');
      } else {
        setError('Terjadi kesalahan saat menyimpan data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/penyaluran-bantuan/${id}/status`, { status_laporan: newStatus });
      setPenyaluranList(prev => prev.map(item => 
        item.id === id ? { ...item, status_laporan: newStatus } : item
      ));
      setMessage('Status berhasil diperbarui.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui status.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const filteredList = penyaluranList.filter(item => 
    item.penerima_bantuan?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jenis_bantuan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penerima_bantuan?.nik?.includes(searchTerm)
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--pk-text)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={28} color="var(--pk-primary)" />
            Pencatatan Penyaluran
          </h1>
          <p style={{ color: 'var(--pk-text-muted)', margin: 0 }}>
            Catat dan pantau realisasi distribusi bantuan kepada penerima
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 500 }}>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 2.2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Form Section */}
        <div className="card glass-effect" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--pk-glass-border)', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)' }}>
            <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <div style={{ width: '6px', height: '20px', background: 'var(--pk-primary)', borderRadius: '4px' }}></div>
              Form Penyaluran Baru
            </h3>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} color="var(--pk-secondary)"/> Penerima Bantuan <span style={{color: 'var(--pk-danger)'}}>*</span>
                </label>
                <select 
                  className="form-control" 
                  name="penerima_bantuan_id" 
                  value={formData.penerima_bantuan_id} 
                  onChange={handleChange} 
                  required
                  style={{ background: 'var(--pk-bg)' }}
                >
                  <option value="">-- Pilih Penerima (Disetujui) --</option>
                  {penerimaList.map(p => (
                    <option key={p.id} value={p.id}>{p.nik} - {p.nama}</option>
                  ))}
                </select>
              </div>

              {programList.length > 0 && (
                <div>
                  <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={16} color="var(--pk-secondary)"/> Program Bantuan <span style={{color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal'}}>(Opsional)</span>
                  </label>
                  <select 
                    className="form-control" 
                    name="program_bantuan_id" 
                    value={formData.program_bantuan_id} 
                    onChange={handleChange}
                    style={{ background: 'var(--pk-bg)' }}
                  >
                    <option value="">-- Pilih Program Bantuan --</option>
                    {programList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_program}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="var(--pk-secondary)"/> Tanggal <span style={{color: 'var(--pk-danger)'}}>*</span>
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="tanggal_penyaluran" 
                    value={formData.tanggal_penyaluran} 
                    onChange={handleChange} 
                    required
                    style={{ background: 'var(--pk-bg)' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tag size={16} color="var(--pk-secondary)"/> Jenis <span style={{color: 'var(--pk-danger)'}}>*</span>
                  </label>
                  <select 
                    className="form-control" 
                    name="jenis_bantuan" 
                    value={formData.jenis_bantuan} 
                    onChange={handleChange} 
                    required
                    style={{ background: 'var(--pk-bg)' }}
                  >
                    <option value="">-- Jenis --</option>
                    <option value="Tunai">Tunai</option>
                    <option value="Sembako">Sembako</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Modal Usaha">Modal Usaha</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={16} color="var(--pk-secondary)"/> Nominal Bantuan <span style={{color: 'var(--pk-danger)'}}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--pk-text-muted)' }}>Rp</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="jumlah_bantuan" 
                    value={formData.jumlah_bantuan} 
                    onChange={handleChange} 
                    placeholder="Contoh: 500000"
                    required 
                    min="0"
                    style={{ paddingLeft: '3rem', background: 'var(--pk-bg)' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Keterangan <span style={{color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal'}}>(Opsional)</span></label>
                <textarea 
                  className="form-control" 
                  name="keterangan" 
                  value={formData.keterangan} 
                  onChange={handleChange} 
                  rows="3"
                  placeholder="Tambahkan keterangan jika perlu..."
                  style={{ background: 'var(--pk-bg)', resize: 'vertical' }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting || loading}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.8rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.5)', borderTopColor: '#fff' }}></div>
                    Menyimpan...
                  </>
                ) : (
                  <><Plus size={18} /> Simpan Penyaluran</>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="card glass-effect" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              Riwayat Distribusi
            </h3>
            <div className="search-bar" style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari penerima / jenis..." 
                className="form-control" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', borderRadius: '2rem', background: 'var(--pk-bg)', padding: '0.5rem 2.5rem' }} 
              />
            </div>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--pk-primary)' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--pk-primary)', margin: '0 auto 1rem' }}></div>
              <p>Memuat riwayat penyaluran...</p>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="table-responsive" style={{ flex: 1 }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Penerima</th>
                    <th>Bantuan</th>
                    <th>Nominal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => (
                    <tr key={item.id} className="animate-fade-in">
                      <td style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(item.tanggal_penyaluran).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>{item.penerima_bantuan?.nama}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>NIK: {item.penerima_bantuan?.nik}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'var(--pk-bg-secondary)', color: 'var(--pk-primary)', fontWeight: 600 }}>
                          {item.jenis_bantuan}
                        </span>
                        {item.program_bantuan && (
                          <div style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--pk-text-muted)' }}>
                            {item.program_bantuan.nama_program}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--pk-text)' }}>
                        {formatRupiah(item.jumlah_bantuan)}
                      </td>
                      <td>
                        <select 
                          className="form-control"
                          value={item.status_laporan}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.75rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            color: item.status_laporan === 'dalam antrian' ? '#f59e0b' : 
                                   item.status_laporan === 'sedang diproses' ? '#60a5fa' : '#34d399',
                            backgroundColor: item.status_laporan === 'dalam antrian' ? 'rgba(245, 158, 11, 0.1)' : 
                                             item.status_laporan === 'sedang diproses' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <option value="dalam antrian">Dalam Antrian</option>
                          <option value="sedang diproses">Sedang Diproses</option>
                          <option value="sudah diproses">Sudah Diproses</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--pk-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--pk-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FolderOpen size={32} style={{ opacity: 0.5, color: 'var(--pk-primary)' }} />
              </div>
              <p style={{ margin: 0, fontWeight: 500 }}>Belum ada data penyaluran</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>Data yang dicatat akan muncul di tabel ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PenyaluranBantuan;
