import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';

const ManajemenDataKeluarga = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [anggota, setAnggota] = useState([]);
  
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [loadingAnggota, setLoadingAnggota] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', relationship: '', job: '', education: '' });

  // Fetch all beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      setError('');
      const res = await api.get('/penerima-bantuan');
      setBeneficiaries(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data penerima bantuan.');
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  // Fetch family members for selected beneficiary
  const fetchFamilyMembers = async (beneficiaryId) => {
    if (!beneficiaryId) {
      setAnggota([]);
      return;
    }
    try {
      setLoadingAnggota(true);
      setError('');
      const res = await api.get(`/family-members?penerima_bantuan_id=${beneficiaryId}`);
      if (res.data.success) {
        setAnggota(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data anggota keluarga.');
    } finally {
      setLoadingAnggota(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    fetchFamilyMembers(selectedBeneficiaryId);
  }, [selectedBeneficiaryId]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        age: item.age,
        relationship: item.relationship,
        job: item.job || '',
        education: item.education || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', age: '', relationship: '', job: '', education: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBeneficiaryId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const res = await api.put(`/family-members/${editingId}`, formData);
        if (res.data.success) {
          setSuccess('Data anggota keluarga berhasil diperbarui!');
          fetchFamilyMembers(selectedBeneficiaryId);
          handleCloseModal();
        }
      } else {
        const res = await api.post('/family-members', {
          ...formData,
          penerima_bantuan_id: parseInt(selectedBeneficiaryId)
        });
        if (res.data.success) {
          setSuccess('Anggota keluarga baru berhasil ditambahkan!');
          fetchFamilyMembers(selectedBeneficiaryId);
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menyimpan data anggota keluarga.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data anggota keluarga ini?")) {
      try {
        setError('');
        setSuccess('');
        const res = await api.delete(`/family-members/${id}`);
        if (res.data.success) {
          setSuccess('Anggota keluarga berhasil dihapus.');
          fetchFamilyMembers(selectedBeneficiaryId);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal menghapus data anggota keluarga.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Manajemen Data Keluarga</h2>
          <p>Kelola informasi anggota keluarga penerima manfaat</p>
        </div>
        {selectedBeneficiaryId && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Tambah Anggota
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {/* Beneficiary Selector Dropdown */}
      <div className="card-premium" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Pilih Penerima Manfaat Utama (Kepala Keluarga):</label>
          {loadingBeneficiaries ? (
            <p>Memuat daftar penerima...</p>
          ) : (
            <select
              className="form-control"
              value={selectedBeneficiaryId}
              onChange={(e) => {
                setSelectedBeneficiaryId(e.target.value);
                setSuccess('');
                setError('');
              }}
              style={{ color: 'var(--pk-text)' }}
            >
              <option value="" style={{background: 'var(--pk-bg-2)'}}>-- Pilih Penerima Bantuan --</option>
              {beneficiaries.map(b => (
                <option key={b.id} value={b.id} style={{background: 'var(--pk-bg-2)'}}>
                  {b.nama} (NIK: {b.nik}) - {b.wilayah || 'Wilayah tidak terdaftar'}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Conditional Content */}
      {selectedBeneficiaryId ? (
        <div className="card-premium animate-fade-in">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <Users size={20} /> Anggota Keluarga dari {beneficiaries.find(b => b.id === parseInt(selectedBeneficiaryId))?.nama}
          </h3>

          {loadingAnggota ? (
            <p>Memuat data anggota keluarga...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Usia</th>
                    <th>Hubungan</th>
                    <th>Pekerjaan</th>
                    <th>Pendidikan</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {anggota.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td>{item.age}</td>
                      <td>{item.relationship}</td>
                      <td>{item.job || '-'}</td>
                      <td>{item.education || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                          <button 
                            onClick={() => handleOpenModal(item)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-primary)' }} 
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--pk-danger)' }} 
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {anggota.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
                  Belum ada data anggota keluarga. Silakan tambah anggota baru.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card-premium" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--pk-text-muted)' }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--pk-primary)' }} />
          <h4 style={{ color: 'var(--pk-text)', marginBottom: '0.5rem' }}>Belum Ada Penerima Bantuan Terpilih</h4>
          <p>Silakan pilih penerima bantuan dari dropdown di atas untuk melihat dan mengelola data anggota keluarga.</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card-premium animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'Edit Anggota' : 'Tambah Anggota'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: 'var(--pk-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required placeholder="Masukkan nama" />
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Usia</label>
                  <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} required placeholder="Contoh: 30" />
                </div>
                <div className="form-group">
                  <label className="form-label">Hubungan</label>
                  <select name="relationship" className="form-control" value={formData.relationship} onChange={handleChange} required style={{ color: 'var(--pk-text)' }}>
                    <option value="" style={{background: 'var(--pk-bg-2)'}}>Pilih Hubungan</option>
                    <option value="Head" style={{background: 'var(--pk-bg-2)'}}>Kepala Keluarga (Head)</option>
                    <option value="Spouse" style={{background: 'var(--pk-bg-2)'}}>Istri/Suami (Spouse)</option>
                    <option value="Child" style={{background: 'var(--pk-bg-2)'}}>Anak (Child)</option>
                    <option value="Other" style={{background: 'var(--pk-bg-2)'}}>Lainnya (Other)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pekerjaan</label>
                <input type="text" name="job" className="form-control" value={formData.job} onChange={handleChange} required placeholder="Masukkan pekerjaan" />
              </div>
              <div className="form-group">
                <label className="form-label">Pendidikan</label>
                <input type="text" name="education" className="form-control" value={formData.education} onChange={handleChange} required placeholder="Masukkan pendidikan terakhir" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal} disabled={submitting}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenDataKeluarga;
