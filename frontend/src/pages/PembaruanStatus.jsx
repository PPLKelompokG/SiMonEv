import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { UserCheck, Search, Plus, CheckCircle, AlertCircle, FolderOpen, RefreshCw, FileText, X, Info } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '2rem' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

const PembaruanStatusInner = () => {
  const [historiList, setHistoriList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    penerima_bantuan_id: '',
    status_baru: '',
    alasan_perubahan: '',
    dokumen_pendukung: null
  });

  const [selectedPenerima, setSelectedPenerima] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resHistori = await api.get('/pembaruan-status/histori');
      setHistoriList(resHistori.data.data);

      const resPenerima = await api.get('/pembaruan-status/penerima');
      setPenerimaList(resPenerima.data.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Pastikan koneksi ke server baik.');
    } finally {
      setLoading(false);
    }
  };

  const handlePenerimaChange = (e) => {
    const id = e.target.value;
    const penerima = penerimaList.find(p => p.id.toString() === id);
    setSelectedPenerima(penerima || null);
    setFormData(prev => ({ ...prev, penerima_bantuan_id: id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, dokumen_pendukung: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPenerima) {
      setError('Pilih penerima bantuan terlebih dahulu.');
      return;
    }
    if (selectedPenerima.status_penerima === formData.status_baru) {
      setError(`Status tidak bisa diubah ke status yang sama (${formData.status_baru}).`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const submitData = new FormData();
    submitData.append('penerima_bantuan_id', formData.penerima_bantuan_id);
    submitData.append('status_baru', formData.status_baru);
    submitData.append('alasan_perubahan', formData.alasan_perubahan);
    if (formData.dokumen_pendukung) {
      submitData.append('dokumen_pendukung', formData.dokumen_pendukung);
    }

    try {
      await api.post('/pembaruan-status', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Status penerima berhasil diperbarui.');
      setFormData({
        penerima_bantuan_id: '',
        status_baru: '',
        alasan_perubahan: '',
        dokumen_pendukung: null
      });
      setSelectedPenerima(null);
      // Reset file input
      document.getElementById('file-upload').value = "";
      
      fetchData(); // Refresh list
      setIsModalOpen(false); // Close modal
      
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'aktif':
        return <span className="badge badge-success">Aktif</span>;
      case 'nonaktif':
        return <span className="badge badge-warning">Nonaktif</span>;
      case 'graduasi':
        return <span className="badge" style={{ background: 'var(--pk-primary)', color: 'white' }}>Graduasi</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredList = historiList.filter(item => 
    item.penerima_bantuan?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penerima_bantuan?.nik?.includes(searchTerm)
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--pk-text)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={28} color="var(--pk-primary)" />
            Pembaruan Status Penerima
          </h1>
          <p style={{ color: 'var(--pk-text-muted)', margin: 0 }}>
            Kelola status aktif, nonaktif, atau kelulusan (graduasi) penerima bantuan
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
        >
          <Plus size={18} />
          Ubah Status Penerima
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pk-success)' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--pk-text)' }}><strong>Aktif:</strong> Masih menerima bantuan</span>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pk-warning)' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--pk-text)' }}><strong>Nonaktif:</strong> Sementara diberhentikan</span>
        </div>
        <div style={{ background: 'rgba(129, 140, 248, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pk-primary)' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--pk-text)' }}><strong>Graduasi:</strong> Lulus program / Mandiri</span>
        </div>
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

      <div className="card glass-effect" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            Histori Perubahan Status
          </h3>
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari penerima / NIK..." 
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
            <p>Memuat histori...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="table-responsive" style={{ flex: 1 }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Penerima</th>
                  <th>Perubahan Status</th>
                  <th>Alasan</th>
                  <th>Dokumen</th>
                  <th>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item.id} className="animate-fade-in">
                    <td style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>{item.penerima_bantuan?.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>NIK: {item.penerima_bantuan?.nik}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusBadge(item.status_lama)}
                        <RefreshCw size={12} color="var(--pk-text-muted)" />
                        {getStatusBadge(item.status_baru)}
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }} title={item.alasan_perubahan}>
                        {item.alasan_perubahan}
                      </span>
                    </td>
                    <td>
                      {item.dokumen_pendukung ? (
                        <a 
                          href={`http://localhost:8000/storage/${item.dokumen_pendukung}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          <FileText size={12} /> Lihat
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--pk-text)' }}>
                      {item.petugas?.name}
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
            <p style={{ margin: 0, fontWeight: 500 }}>Belum ada data histori</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>Perubahan status yang dicatat akan muncul di tabel ini.</p>
          </div>
        )}
      </div>

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
                Ubah Status Penerima
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
                    <Search size={16} color="var(--pk-secondary)"/> Penerima Bantuan <span style={{color: 'var(--pk-danger)'}}>*</span>
                  </label>
                  <select 
                    className="form-control" 
                    name="penerima_bantuan_id" 
                    value={formData.penerima_bantuan_id} 
                    onChange={handlePenerimaChange} 
                    required
                    style={{ background: 'var(--pk-bg)' }}
                  >
                    <option value="">-- Cari / Pilih Penerima --</option>
                    {penerimaList.map(p => (
                      <option key={p.id} value={p.id}>{p.nik} - {p.nama}</option>
                    ))}
                  </select>
                </div>

                {selectedPenerima && (
                  <div style={{ background: 'var(--pk-bg-3)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Status Saat Ini:</span>
                      {getStatusBadge(selectedPenerima.status_penerima)}
                    </div>
                    <RefreshCw size={20} color="var(--pk-text-muted)" style={{ opacity: 0.5 }} />
                    <div style={{ flex: 1, marginLeft: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Ubah Menjadi: <span style={{color: 'var(--pk-danger)'}}>*</span></span>
                      <select 
                        className="form-control" 
                        name="status_baru" 
                        value={formData.status_baru} 
                        onChange={handleChange} 
                        required
                        style={{ padding: '0.5rem' }}
                      >
                        <option value="">-- Pilih --</option>
                        {selectedPenerima.status_penerima !== 'aktif' && <option value="aktif">Aktif</option>}
                        {selectedPenerima.status_penerima !== 'nonaktif' && <option value="nonaktif">Nonaktif</option>}
                        {selectedPenerima.status_penerima !== 'graduasi' && <option value="graduasi">Graduasi</option>}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Alasan Perubahan <span style={{color: 'var(--pk-danger)'}}>*</span></label>
                  <textarea 
                    className="form-control" 
                    name="alasan_perubahan" 
                    value={formData.alasan_perubahan} 
                    onChange={handleChange} 
                    rows="3"
                    placeholder="Jelaskan alasan perubahan status..."
                    required
                    style={{ background: 'var(--pk-bg)', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Dokumen Pendukung <span style={{color: 'var(--pk-text-muted)', fontSize: '0.8rem', fontWeight: 'normal'}}>(Opsional, Max 2MB)</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="file" 
                      id="file-upload"
                      name="dokumen_pendukung" 
                      onChange={handleFileChange} 
                      className="form-control"
                      accept=".jpg,.jpeg,.png,.pdf"
                      style={{ background: 'var(--pk-bg)', padding: '0.5rem' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Info size={14} /> Jika graduasi, disarankan melampirkan bukti pendukung kelayakan.
                  </div>
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
                    disabled={submitting || loading || !selectedPenerima}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.5)', borderTopColor: '#fff' }}></div>
                        Menyimpan...
                      </>
                    ) : (
                      <><CheckCircle size={18} /> Terapkan Perubahan</>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const PembaruanStatus = () => (
  <ErrorBoundary>
    <PembaruanStatusInner />
  </ErrorBoundary>
);

export default PembaruanStatus;
