import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, UserPlus, CheckCircle, LogOut } from 'lucide-react';

const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`
      }
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', textDecoration: 'none'
      }}
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
          <h2 style={{ color: 'var(--pk-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--pk-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              SM
            </div>
            SiMonEv
          </h2>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
          
          {user?.role === 'admin' && (
            <SidebarLink to="/users" icon={<Users size={20} />} label="Manajemen Akun" />
          )}

          <SidebarLink to="/penerima-bantuan" icon={<UserPlus size={20} />} label="Pendaftaran Bantuan" />
          
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <SidebarLink to="/verifikasi" icon={<CheckCircle size={20} />} label="Verifikasi Data" />
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
