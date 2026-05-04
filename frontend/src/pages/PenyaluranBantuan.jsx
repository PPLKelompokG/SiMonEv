import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Package, Search, Plus, FileText, CheckCircle, AlertCircle, FolderOpen, Calendar, DollarSign, Tag, User, X, Info } from 'lucide-react';

const PenyaluranBantuan = () => {
  const [penyaluranList, setPenyaluranList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

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
      setIsModalOpen(false); // Close modal on success
      
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
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
        >
          <Plus size={18} />
          Tambah Penyaluran
        </button>
      </div>

      {message && (
        <div className="alert alert-success animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 500 }}>{message}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* List Section - Now full width */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--pk-primary)" />
            Riwayat Distribusi
          </h3>
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari penerima / jenis..." 
              className="form-control" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: '2rem', background: 'var(--pk-bg)', padding: '0.5rem 2.5rem', height: '36px' }} 
            />
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--pk-primary)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--pk-primary)', margin: '0 auto 1rem' }}></div>
            <p>Memuat riwayat penyaluran...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Penerima</th>
                  <th>Bantuan</th>
                  <th>Nominal</th>
                  <th style={{ textAlign: 'center' }}>Progress</th>
                  <th style={{ textAlign: 'center' }}>Approval</th>
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
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--pk-bg-secondary)', color: 'var(--pk-primary)', fontWeight: 600 }}>
                        {item.jenis_bantuan}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--pk-text)' }}>
                      {formatRupiah(item.jumlah_bantuan)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select 
                        className="form-control"
                        value={item.status_laporan}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={item.status_approval === 'approved'}
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          border: '1px solid transparent',
                          cursor: item.status_approval === 'approved' ? 'not-allowed' : 'pointer',
                          color: item.status_laporan === 'dalam antrian' ? '#f59e0b' : 
                                 item.status_laporan === 'sedang diproses' ? '#60a5fa' : '#34d399',
                          backgroundColor: item.status_laporan === 'dalam antrian' ? 'rgba(245, 158, 11, 0.1)' : 
                                           item.status_laporan === 'sedang diproses' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          textAlign: 'center',
                          width: 'auto',
                          display: 'inline-block',
                          opacity: item.status_approval === 'approved' ? 0.6 : 1
                        }}
                      >
                        <option value="dalam antrian">Dalam Antrian</option>
                        <option value="sedang diproses">Sedang Diproses</option>
                        <option value="sudah diproses">Sudah Diproses</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                        {item.status_approval === 'approved' ? (
                          <span className="badge badge-success">Disetujui</span>
                        ) : item.status_approval === 'returned' ? (
                          <span className="badge badge-danger">Dikembalikan</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                        
                        <span 
                          onClick={() => setDetailModal(item)}
                          style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--pk-primary)', 
                            cursor: 'pointer', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontWeight: 500
                          }}
                        >
                          <Info size={14} /> Lihat Detail
                        </span>
                      </div>
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

      {/* Modal Form Section */}
      {isModalOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="animate-slide-up" style={{ 
            width: '100%', 
            maxWidth: '650px', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            margin: '1rem',
            background: 'var(--pk-bg-2)',
            borderRadius: 'var(--pk-radius)'
          }}>
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--pk-glass-border)', 
              background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--pk-primary)', borderRadius: '4px' }}></div>
                Form Penyaluran Baru
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
              )}

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
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--pk-text)' }}>Rp</span>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting || loading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={submitting || loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
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
                </div>

              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {detailModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="animate-slide-up" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            margin: '1rem',
            background: 'var(--pk-bg-2)',
            borderRadius: 'var(--pk-radius)'
          }}>
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--pk-glass-border)', 
              background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--pk-danger)', borderRadius: '4px' }}></div>
                Detail Approval Laporan
              </h3>
              <button 
                onClick={() => setDetailModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Penerima</label>
                <div style={{ fontWeight: 600 }}>{detailModal.penerima_bantuan?.nama}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)' }}>NIK: {detailModal.penerima_bantuan?.nik}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Program & Jenis Bantuan</label>
                <div style={{ fontWeight: 500 }}>
                  {detailModal.program_bantuan?.nama_program || 'Tanpa Program'} ({detailModal.jenis_bantuan})
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Nominal</label>
                <div style={{ fontWeight: 600, color: 'var(--pk-primary)' }}>{formatRupiah(detailModal.jumlah_bantuan)}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Catatan Koreksi (Supervisor)</label>
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--pk-text)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  {detailModal.catatan_koreksi || 'Tidak ada catatan.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setDetailModal(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PenyaluranBantuan;
