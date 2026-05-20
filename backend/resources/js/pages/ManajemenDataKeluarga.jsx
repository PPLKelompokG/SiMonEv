import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';

const dummyData = [
  { id: 1, name: 'Ahmad Susanto', age: 42, relation: 'Head', occupation: 'Laborer', education: 'Elementary' },
  { id: 2, name: 'Siti Rahayu', age: 38, relation: 'Spouse', occupation: 'Housewife', education: 'Elementary' },
  { id: 3, name: 'Budi Ahmad', age: 15, relation: 'Child', occupation: 'Student', education: 'Junior High' },
  { id: 4, name: 'Dewi Ahmad', age: 12, relation: 'Child', occupation: 'Student', education: 'Elementary' }
];

const ManajemenDataKeluarga = () => {
  const [anggota, setAnggota] = useState(dummyData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', relation: '', occupation: '', education: '' });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ name: '', age: '', relation: '', occupation: '', education: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setAnggota(anggota.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      setAnggota([...anggota, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data anggota keluarga ini?")) {
      setAnggota(anggota.filter(a => a.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Manajemen Data Keluarga</h2>
          <p>Kelola informasi anggota keluarga penerima manfaat</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Tambah Anggota
        </button>
      </div>

      <div className="glass-panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <Users size={20} /> Anggota Keluarga
        </h3>

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
                  <td>{item.relation}</td>
                  <td>{item.occupation}</td>
                  <td>{item.education}</td>
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
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
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
                  <select name="relation" className="form-control" value={formData.relation} onChange={handleChange} required>
                    <option value="">Pilih Hubungan</option>
                    <option value="Head">Kepala Keluarga (Head)</option>
                    <option value="Spouse">Istri/Suami (Spouse)</option>
                    <option value="Child">Anak (Child)</option>
                    <option value="Other">Lainnya (Other)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pekerjaan</label>
                <input type="text" name="occupation" className="form-control" value={formData.occupation} onChange={handleChange} required placeholder="Masukkan pekerjaan" />
              </div>
              <div className="form-group">
                <label className="form-label">Pendidikan</label>
                <input type="text" name="education" className="form-control" value={formData.education} onChange={handleChange} required placeholder="Masukkan pendidikan terakhir" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Simpan Perubahan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenDataKeluarga;
