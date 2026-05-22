import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', role: 'petugas_lapangan', is_active: true });
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (formData.id) {
        await api.put(`/users/${formData.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Yakin ingin menghapus pengguna ${user.name}?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error menghapus user');
    }
  };

  const openAdd = () => {
    setFormData({ id: null, name: '', email: '', password: '', role: 'petugas_lapangan', is_active: true });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setFormData({ ...user, password: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Manajemen Akun</h2>
          <p>Kelola akses pengguna sistem</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Tambah Akun
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
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-warning">{u.role?.replace('_', ' ')}</span></td>
                    <td>
                      {u.is_active ? 
                        <span className="badge badge-success">Aktif</span> : 
                        <span className="badge badge-danger">Nonaktif</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => openEdit(u)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--pk-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDelete(u)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign:'center' }}>Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--pk-text)', fontWeight: 700 }}>{formData.id ? 'Edit Akun' : 'Tambah Akun'}</h3>
            {formError && <p style={{ color: 'var(--pk-danger)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{formError}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password {formData.id && <span style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)' }}>(Kosongkan jika tak diubah)</span>}</label>
                <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!formData.id} minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ color: 'var(--pk-text)' }}>
                  <option value="admin" style={{background: 'var(--pk-bg-2)'}}>Admin</option>
                  <option value="supervisor" style={{background: 'var(--pk-bg-2)'}}>Supervisor</option>
                  <option value="petugas_lapangan" style={{background: 'var(--pk-bg-2)'}}>Petugas Lapangan</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--pk-primary)' }} />
                <label htmlFor="is_active" style={{ fontWeight: 600, color: 'var(--pk-text)' }}>Status Aktif</label>
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

export default UserManagement;
