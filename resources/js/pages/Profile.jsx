import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save functionality
    alert('Fungsi update profil akan segera diimplementasikan dengan endpoint backend.');
  };

  return (
    <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User className="text-primary" size={24} /> Edit Profil
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Avatar Upload Placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--pk-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--pk-primary)', overflow: 'hidden' }}>
              <img src="/user.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <User size={32} style={{ display: 'none', color: 'var(--pk-text-muted)' }} />
              
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={14} color="#fff" />
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Foto Profil</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Klik ikon kamera untuk mengubah foto (JPG/PNG max 2MB).</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16}/> Nama Lengkap</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16}/> Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <hr style={{ borderColor: 'var(--pk-glass-border)', margin: '1rem 0' }} />
          
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Ubah Password</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>Kosongkan jika tidak ingin mengubah password.</p>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={16}/> Password Baru</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16}/> Konfirmasi Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Save size={18} /> Simpan Perubahan
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1rem' }}>Informasi Akun</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Role Hak Akses</span>
            <span className="badge badge-success" style={{ marginTop: '0.5rem', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--pk-text-muted)' }}>Status Akun</span>
            <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 600, color: 'var(--pk-secondary)' }}>Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
