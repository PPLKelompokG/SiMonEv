import React, { useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, UserPlus, CheckCircle, LogOut, Activity, Briefcase, Package, UserCheck } from 'lucide-react';

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

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
        
        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
          
          {user?.role === 'admin' && (
            <>
              <SidebarLink to="/users" icon={<Users size={20} />} label="Manajemen Akun" />
              <SidebarLink to="/program-bantuan" icon={<Briefcase size={20} />} label="Program Bantuan" />
            </>
          )}

          <SidebarLink to="/penerima-bantuan" icon={<UserPlus size={20} />} label="Pendaftaran Bantuan" />
          
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <SidebarLink to="/verifikasi" icon={<CheckCircle size={20} />} label="Verifikasi Data" />
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
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="app-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
