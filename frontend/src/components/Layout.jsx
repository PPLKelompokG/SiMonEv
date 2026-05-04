import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Users, UserPlus, CheckCircle, LogOut, Activity, 
  Briefcase, FileText, Heart, ClipboardCheck, MapPin, BarChart3, Package,
  Sun, Moon
} from 'lucide-react';

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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
              <img src="/logo.png" alt="SiMonEv Logo" style={{ width: '45px', height: '45px', objectFit: 'contain', background: 'white', borderRadius: '10px', padding: '4px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ display: 'none', width: '40px', height: '40px', background: 'var(--pk-primary)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <span style={{ color: 'var(--pk-text)' }}>SiMon<span style={{ color: 'var(--pk-primary)' }}>Ev</span></span>
            </h2>
          </Link>
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
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

          {/* New Sprint Routes from Main Branch */}
          <SidebarLink to="/status-gizi" icon={<Activity size={20} />} label="Status Gizi" />
          <SidebarLink to="/kia" icon={<Heart size={20} />} label="Kesehatan Ibu & Anak" />
          <SidebarLink to="/distribusi-pangan" icon={<Package size={20} />} label="Distribusi Pangan" />
          <SidebarLink to="/kunjungan-rumah" icon={<MapPin size={20} />} label="Kunjungan Rumah" />
          
          {user?.role === 'admin' && (
            <>
              <SidebarLink to="/kinerja-petugas" icon={<BarChart3 size={20} />} label="Kinerja Petugas" />
              <SidebarLink to="/dashboard-kpi" icon={<Activity size={20} />} label="KPI Kemiskinan" />
            </>
          )}

          {/* PBI-06 Laporan */}
          <SidebarLink to="/laporan" icon={<FileText size={20} />} label="Laporan" />

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              onClick={handleLogout}
              style={{ width: '100%', background: 'transparent', color: 'var(--pk-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'var(--pk-transition)' }}
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
            <button 
              onClick={toggleTheme} 
              style={{ background: 'rgba(128, 128, 128, 0.1)', border: '1px solid var(--pk-glass-border)', color: 'var(--pk-text)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--pk-transition)' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '2px solid var(--pk-primary)' }}>
              <img src="/user.png" alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span style={{ display: 'none', fontWeight: 'bold', color: 'var(--pk-primary)' }}>{user?.name?.charAt(0).toUpperCase()}</span>
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