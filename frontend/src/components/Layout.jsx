import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, UserPlus, CheckCircle, LogOut, Activity, Briefcase, Package, UserCheck, Edit, X, Heart } from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const SidebarSection = ({ title }) => (
  <div style={{ 
    fontSize: '0.75rem', 
    fontWeight: '700', 
    color: 'var(--pk-text-muted)', 
    textTransform: 'uppercase', 
    letterSpacing: '0.1em',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    paddingLeft: '1.15rem'
  }}>
    {title}
  </div>
);

const Layout = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit Profile Form States
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditPassword('');
    setError('');
    setSuccess('');
    setIsDropdownOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put('/profile', {
        name: editName,
        password: editPassword || null
      });
      
      updateUser(response.data.user);
      setSuccess('Profil berhasil diperbarui!');
      setEditPassword('');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--pk-glass-border)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.4)' }}>
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <span style={{ color: 'var(--pk-text)' }}>SiMon<span style={{ color: 'var(--pk-primary)' }}>Ev</span></span>
            </h2>
          </Link>
        </div>
        
        <nav style={{ padding: '0.5rem 1rem 1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <SidebarSection title="UTAMA" />
          <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
          
          {user?.role === 'admin' && (
            <>
              <SidebarSection title="MANAJEMEN PROGRAM" />
              <SidebarLink to="/program-bantuan" icon={<Briefcase size={20} />} label="Program Bantuan" />
              <SidebarLink to="/permintaan-kuota" icon={<Activity size={20} />} label="Permintaan Kuota" />
              <SidebarLink to="/users" icon={<Users size={20} />} label="Manajemen Akun" />
            </>
          )}

          <SidebarSection title="MANAJEMEN PENERIMA" />
          <SidebarLink to="/penerima-bantuan" icon={<UserPlus size={20} />} label="Pendaftaran Bantuan" />
          <SidebarLink to="/manajemen-data-keluarga" icon={<Users size={20} />} label="Manajemen Data Keluarga" />
          
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <>
              <SidebarSection title="EVALUASI & VERIFIKASI" />
              <SidebarLink to="/verifikasi" icon={<CheckCircle size={20} />} label="Verifikasi Data" />
            </>
          )}

          {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
            <SidebarLink to="/penyaluran-bantuan" icon={<Package size={20} />} label="Penyaluran Bantuan" />
          )}

          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <SidebarLink to="/approval-penyaluran" icon={<Package size={20} />} label="Approval Laporan" />
          )}

          {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
            <SidebarLink to="/pembaruan-status" icon={<UserCheck size={20} />} label="Status Penerima" />
          )}

          <SidebarSection title="KESEHATAN & GIZI" />
          {(user?.role === 'admin' || user?.role === 'petugas_lapangan' || user?.role === 'supervisor') && (
            <SidebarLink to="/status-gizi" icon={<Heart size={20} />} label="Status Gizi" />
          )}
          
          <div style={{ marginTop: 'auto' }}>
            <button 
              onClick={handleLogout}
              style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: 'var(--pk-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'var(--pk-transition)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <header className="app-header">
          <div>
            <h3 style={{ margin: 0, fontWeight: 500 }}>Sistem Monitoring & Evaluasi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </span>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', color: 'white', userSelect: 'none' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              {isDropdownOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '55px', 
                  right: '0', 
                  width: '220px', 
                  padding: '0.5rem', 
                  zIndex: 50, 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)'
                }}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#fff', letterSpacing: '0.02em' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pk-text-muted)', marginTop: '0.2rem' }}>{user?.email}</div>
                  </div>
                  
                  <button onClick={openEditModal} style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--pk-text)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--pk-text)'; }}>
                    <Edit size={16} /> Edit Profile
                  </button>
                  
                  <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--pk-danger)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', marginTop: '0.2rem', fontSize: '0.875rem', fontWeight: '500' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--pk-danger)'; }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="app-content animate-fade-in">
          <Outlet />
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20}/> Edit Profile</h3>
                <button className="btn-close" onClick={() => setIsEditModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--pk-danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
              {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--pk-success)', color: '#86efac', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

              <form onSubmit={handleEditProfile}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password Baru (Opsional)</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Biarkan kosong jika tidak ingin diubah"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    minLength="8"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
