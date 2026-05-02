import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, UserPlus, CheckCircle, LogOut, Activity, Briefcase, Package, UserCheck, Edit, X, Heart, ShoppingBag, Menu, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList } from 'lucide-react';
import api from '../api';

const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
    </NavLink>
  );
};

const AccordionMenu = ({ title, icon, children, defaultOpen = false, accentColor = 'var(--pk-primary)', bgOpacity = 'rgba(255,255,255,0.05)' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0.85rem 1.15rem',
          borderRadius: '12px',
          cursor: 'pointer',
          color: isOpen ? accentColor : 'var(--pk-text-muted)',
          background: isOpen ? bgOpacity : 'transparent',
          borderLeft: isOpen ? `4px solid ${accentColor}` : '4px solid transparent',
          transition: 'all 0.2s ease',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em'
        }}
        onMouseOver={(e) => { 
          if(!isOpen) {
            e.currentTarget.style.color = 'var(--pk-text)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }
        }}
        onMouseOut={(e) => { 
          if(!isOpen) {
            e.currentTarget.style.color = 'var(--pk-text-muted)';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon}
          <span style={{ whiteSpace: 'nowrap' }}>{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      
      {isOpen && (
        <div className="animate-fade-in" style={{ paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Layout = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    <div className="app-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside 
        className="app-sidebar" 
        style={{ 
          width: isSidebarOpen ? '260px' : '0px',
          minWidth: isSidebarOpen ? '260px' : '0px',
          opacity: isSidebarOpen ? 1 : 0,
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRight: isSidebarOpen ? '1px solid var(--pk-glass-border)' : 'none'
        }}
      >
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--pk-glass-border)', minWidth: '260px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.4)' }}>
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <span style={{ color: 'var(--pk-text)' }}>SiMon<span style={{ color: 'var(--pk-primary)' }}>Ev</span></span>
            </h2>
          </Link>
        </div>
        
        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', minWidth: '260px' }}>
          {/* Dashboard Standalone */}
          <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
          
          <div style={{ marginTop: '1rem' }}>
            {user?.role === 'admin' && (
              <AccordionMenu 
                title="Manajemen Program" 
                icon={<Briefcase size={18} />} 
                defaultOpen={true}
                accentColor="var(--pk-primary)"
                bgOpacity="rgba(129, 140, 248, 0.15)"
              >
                <SidebarLink to="/program-bantuan" icon={<LayoutDashboard size={18} />} label="Program Bantuan" />
                <SidebarLink to="/permintaan-kuota" icon={<Activity size={18} />} label="Permintaan Kuota" />
                <SidebarLink to="/users" icon={<Users size={18} />} label="Manajemen Akun" />
              </AccordionMenu>
            )}

            <AccordionMenu 
              title="Manajemen Penerima" 
              icon={<Users size={18} />} 
              defaultOpen={true}
              accentColor="var(--pk-warning)"
              bgOpacity="rgba(251, 191, 36, 0.15)"
            >
              <SidebarLink to="/penerima-bantuan" icon={<UserPlus size={18} />} label="Pendaftaran Bantuan" />
              <SidebarLink to="/manajemen-data-keluarga" icon={<Users size={18} />} label="Data Keluarga" />
            </AccordionMenu>
            
            {(user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'petugas_lapangan') && (
              <AccordionMenu 
                title="Evaluasi & Verifikasi" 
                icon={<CheckCircle size={18} />} 
                defaultOpen={true}
                accentColor="var(--pk-success)"
                bgOpacity="rgba(52, 211, 153, 0.15)"
              >
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <SidebarLink to="/verifikasi" icon={<ClipboardList size={18} />} label="Verifikasi Data" />
                )}
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <SidebarLink to="/kinerja-petugas" icon={<Activity size={18} />} label="Kinerja Petugas" />
                )}
                {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
                  <>
                    <SidebarLink to="/penyaluran-bantuan" icon={<Package size={18} />} label="Penyaluran Bantuan" />
                    <SidebarLink to="/distribusi-pangan" icon={<ShoppingBag size={18} />} label="Distribusi Pangan" />
                  </>
                )}
                {(user?.role === 'admin' || user?.role === 'supervisor') && (
                  <SidebarLink to="/approval-penyaluran" icon={<Package size={18} />} label="Approval Laporan" />
                )}
                {(user?.role === 'admin' || user?.role === 'petugas_lapangan') && (
                  <SidebarLink to="/pembaruan-status" icon={<UserCheck size={18} />} label="Status Penerima" />
                )}
              </AccordionMenu>
            )}

            {(user?.role === 'admin' || user?.role === 'petugas_lapangan' || user?.role === 'supervisor') && (
              <AccordionMenu 
                title="Kesehatan & Gizi" 
                icon={<Heart size={18} />} 
                defaultOpen={false}
                accentColor="var(--pk-danger)"
                bgOpacity="rgba(248, 113, 113, 0.15)"
              >
                <SidebarLink to="/status-gizi" icon={<Heart size={18} />} label="Status Gizi" />
                <SidebarLink to="/kia" icon={<Activity size={18} />} label="KIA (Ibu & Balita)" />
              </AccordionMenu>
            )}
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button 
              onClick={handleLogout}
              style={{ width: '100%', background: 'transparent', color: 'var(--pk-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'var(--pk-transition)' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease' }}>
        <header className="app-header" style={{ height: '70px', borderBottom: '1px solid var(--pk-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'transparent', border: 'none', color: 'var(--pk-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Menu size={24} />
            </button>
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
        
        <div className="app-content animate-fade-in" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
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
