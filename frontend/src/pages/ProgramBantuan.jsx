import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { programBantuanService } from '../api/programBantuanService';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Briefcase
} from 'lucide-react';

const ProgramBantuan = () => {
  const { user } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [formData, setFormData] = useState({
    nama_program: '',
    kategori_sdg: '',
    anggaran: '',
    periode: '',
    status: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await programBantuanService.getAll();
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch programs", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (program = null) => {
    if (program) {
      setCurrentProgram(program);
      setFormData({
        nama_program: program.nama_program,
        kategori_sdg: program.kategori_sdg,
        anggaran: program.anggaran,
        periode: program.periode,
        status: program.status
      });
    } else {
      setCurrentProgram(null);
      setFormData({
        nama_program: '',
        kategori_sdg: '',
        anggaran: '',
        periode: '',
        status: true
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProgram(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? true : false) : value
    }));
    // clear error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const errors = {};
    if (!formData.nama_program) errors.nama_program = 'Nama program wajib diisi';
    if (!formData.kategori_sdg) errors.kategori_sdg = 'Kategori SDG wajib diisi';
    if (!formData.anggaran || formData.anggaran <= 0) errors.anggaran = 'Anggaran tidak valid';
    if (!formData.periode) errors.periode = 'Periode wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      if (currentProgram) {
        await programBantuanService.update(currentProgram.id, formData);
      } else {
        await programBantuanService.create(formData);
      }
      await fetchPrograms();
      closeModal();
    } catch (error) {
      console.error("Error submitting form", error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Terjadi kesalahan sistem');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus program bantuan ini?')) {
      try {
        await programBantuanService.delete(id);
        await fetchPrograms();
      } catch (error) {
        console.error("Error deleting program", error);
        alert(error.response?.data?.message || 'Gagal menghapus data');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPrograms = programs.filter(program => 
    program.nama_program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.kategori_sdg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--pk-text)', marginBottom: '0.25rem' }}>
            Manajemen Program Bantuan
          </h1>
          <p style={{ color: 'var(--pk-text-muted)', margin: 0 }}>
            Kelola data program bantuan sosial dan alokasi anggaran
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            className="btn btn-primary" 
            onClick={() => openModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
          >
            <Plus size={18} />
            Tambah Program
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} color="var(--pk-primary)" />
            Daftar Program Bantuan
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'var(--pk-text-muted)', fontSize: '0.875rem' }}>
              Total: <strong>{filteredPrograms.length}</strong> Program
            </div>
            <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--pk-text-muted)' }} />
              <input 
                type="text" 
                className="form-control"
                placeholder="Cari nama program atau kategori..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', borderRadius: '2rem', background: 'var(--pk-bg)', padding: '0.5rem 2.5rem', height: '36px' }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--pk-primary)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--pk-primary)', margin: '0 auto 1rem' }}></div>
            Memuat data program...
          </div>
        ) : filteredPrograms.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama Program</th>
                  <th>Kategori SDG</th>
                  <th>Anggaran</th>
                  <th>Periode</th>
                  <th>Status</th>
                  {user?.role === 'admin' && <th style={{ textAlign: 'center' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>
                        {program.nama_program}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--pk-bg-secondary)', color: 'var(--pk-primary)' }}>
                        {program.kategori_sdg}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {formatCurrency(program.anggaran)}
                    </td>
                    <td>{program.periode}</td>
                    <td>
                      {program.status ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--pk-danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={12} /> Nonaktif
                        </span>
                      )}
                    </td>
                    {user?.role === 'admin' && (
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem', border: 'none', color: 'var(--pk-primary)', background: 'rgba(139, 92, 246, 0.1)' }}
                            onClick={() => openModal(program)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem', border: 'none', color: 'var(--pk-danger)', background: 'rgba(239, 68, 68, 0.1)' }}
                            onClick={() => handleDelete(program.id)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--pk-text-muted)' }}>
            <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Tidak ada data program bantuan yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card glass-effect animate-slide-up" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          }}>
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--pk-glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.3)'
            }}>
              <h3 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--pk-primary)', borderRadius: '4px' }}></div>
                {currentProgram ? 'Edit Program Bantuan' : 'Tambah Program Baru'}
              </h3>
              <button 
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Nama Program Bantuan</label>
                  <input 
                    type="text" 
                    className={`form-control ${formErrors.nama_program ? 'is-invalid' : ''}`}
                    name="nama_program"
                    value={formData.nama_program}
                    onChange={handleInputChange}
                    placeholder="Contoh: Bantuan Pangan Non Tunai"
                  />
                  {formErrors.nama_program && (
                    <div style={{ color: 'var(--pk-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.nama_program}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Kategori SDG</label>
                  <select 
                    className={`form-control ${formErrors.kategori_sdg ? 'is-invalid' : ''}`}
                    name="kategori_sdg"
                    value={formData.kategori_sdg}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Tanpa Kemiskinan">Tanpa Kemiskinan</option>
                    <option value="Tanpa Kelaparan">Tanpa Kelaparan</option>
                    <option value="Pendidikan Berkualitas">Pendidikan Berkualitas</option>
                    <option value="Kesehatan yang Baik">Kesehatan yang Baik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {formErrors.kategori_sdg && (
                    <div style={{ color: 'var(--pk-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.kategori_sdg}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Periode</label>
                  <input 
                    type="text" 
                    className={`form-control ${formErrors.periode ? 'is-invalid' : ''}`}
                    name="periode"
                    value={formData.periode}
                    onChange={handleInputChange}
                    placeholder="Contoh: Tahun 2026"
                  />
                  {formErrors.periode && (
                    <div style={{ color: 'var(--pk-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.periode}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Anggaran (Rp)</label>
                  <input 
                    type="number" 
                    className={`form-control ${formErrors.anggaran ? 'is-invalid' : ''}`}
                    name="anggaran"
                    value={formData.anggaran}
                    onChange={handleInputChange}
                    placeholder="Masukkan jumlah anggaran"
                    min="0"
                  />
                  {formErrors.anggaran && (
                    <div style={{ color: 'var(--pk-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.anggaran}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--pk-primary)', cursor: 'pointer' }}
                    />
                    Status Program Aktif
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {submitting && <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>}
                  {currentProgram ? 'Simpan Perubahan' : 'Tambah Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramBantuan;
