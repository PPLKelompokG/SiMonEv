import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getUnreadCount } from '../api/notifikasiService';
import { 
  Home, Users, UserPlus, CheckCircle, LogOut, Activity, 
  Briefcase, FileText, Heart, ClipboardCheck, MapPin, BarChart3, Package,
  Sun, Moon, Target, UserCheck, DollarSign, ChevronRight, ChevronDown, Menu, User, Bell, History
} from 'lucide-react';

const SidebarLink = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link relative ${isActive ? 'active' : ''}`}
      title={label}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="active-indicator"
              className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl"
              style={{ borderLeft: '4px solid var(--pk-primary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <span className="relative z-10" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '20px', height: '20px' }}>{icon}</span>
            <span className="sidebar-text">{label}</span>
          </span>
        </>
      )}
    </NavLink>
  );
};

const AccordionGroup = ({ title, icon, isExpanded, onToggle, children }) => {
  if (!children) return null;
  
  const hasValidChildren = React.Children.toArray(children).some(child => {
    if (!child) return false;
    if (child.type === React.Fragment) {
      return React.Children.toArray(child.props.children).some(c => c);
    }
    return true;
  });

  if (!hasValidChildren) return null;

  return (
    <div className="accordion-group">
      <div className="accordion-header" onClick={onToggle} title={title}>
        <div className="accordion-header-left">
          <span className="accordion-icon">{icon}</span>
          <span className="sidebar-text">{title}</span>
        </div>
        <div className="accordion-arrow">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>
      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="accordion-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [expandedMenus, setExpandedMenus] = useState(['dashboard', 'penerima']);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notification count on mount + every 60 seconds
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data?.unread_count ?? 0);
      } catch {
        // silently ignore — user may not be authenticated yet
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`mobile-overlay ${!isSidebarCollapsed ? 'active' : ''}`}
        onClick={() => setIsSidebarCollapsed(true)}
      ></div>

      {/* Sidebar */}
      <aside className={`app-sidebar sidebar-glass ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--pk-glass-border)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <h2 className="logo-wrapper" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
              <img src="/logo.png" alt="SiMonEv Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div style={{ display: 'none', width: '40px', height: '40px', background: 'var(--pk-primary)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <span className="sidebar-text" style={{ color: 'var(--pk-text)' }}>SiMon<span style={{ color: 'var(--pk-primary)' }}>Ev</span></span>
            </h2>
          </Link>
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          
          <AccordionGroup 
            title="Dashboard & Peta" 
            icon={<Home size={20} />} 
            isExpanded={expandedMenus.includes('dashboard')}
            onToggle={() => toggleMenu('dashboard')}
          >
            <SidebarLink to="/dashboard" icon={<Activity size={18} />} label="Dashboard" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/peta-sebaran" icon={<MapPin size={18} />} label="Peta Sebaran" onClick={closeSidebarOnMobile} />
            {user?.role === 'admin' && (
              <SidebarLink to="/dashboard-kpi" icon={<Target size={18} />} label="KPI Kemiskinan" onClick={closeSidebarOnMobile} />
            )}
          </AccordionGroup>

          {user?.role === 'admin' && (
            <AccordionGroup 
              title="Data Master" 
              icon={<Briefcase size={20} />} 
              isExpanded={expandedMenus.includes('master')}
              onToggle={() => toggleMenu('master')}
            >
              <SidebarLink to="/users" icon={<Users size={18} />} label="Manajemen Akun" onClick={closeSidebarOnMobile} />
              <SidebarLink to="/program-bantuan" icon={<Package size={18} />} label="Program Bantuan" onClick={closeSidebarOnMobile} />
            </AccordionGroup>
          )}

          <AccordionGroup 
            title="Penerima Manfaat" 
            icon={<Users size={20} />} 
            isExpanded={expandedMenus.includes('penerima')}
            onToggle={() => toggleMenu('penerima')}
          >
            <SidebarLink to="/penerima-bantuan" icon={<UserPlus size={18} />} label="Pendaftaran Bantuan" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/manajemen-data-keluarga" icon={<Users size={18} />} label="Manajemen Data Keluarga" onClick={closeSidebarOnMobile} />
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <SidebarLink to="/verifikasi" icon={<CheckCircle size={18} />} label="Verifikasi Data" onClick={closeSidebarOnMobile} />
            )}
            <SidebarLink to="/pembaruan-status" icon={<UserCheck size={18} />} label="Graduasi (Status)" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/riwayat-bantuan" icon={<History size={18} />} label="Riwayat Bantuan" onClick={closeSidebarOnMobile} />
          </AccordionGroup>

          <AccordionGroup 
            title="Kesehatan & Gizi" 
            icon={<Heart size={20} />} 
            isExpanded={expandedMenus.includes('kesehatan')}
            onToggle={() => toggleMenu('kesehatan')}
          >
            <SidebarLink to="/status-gizi" icon={<Activity size={18} />} label="Status Gizi" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/kia" icon={<Heart size={18} />} label="Kesehatan Ibu & Anak" onClick={closeSidebarOnMobile} />
          </AccordionGroup>

          <AccordionGroup 
            title="Operasional Lapangan" 
            icon={<Package size={20} />} 
            isExpanded={expandedMenus.includes('operasional')}
            onToggle={() => toggleMenu('operasional')}
          >
            <SidebarLink to="/kunjungan-rumah" icon={<MapPin size={18} />} label="Kunjungan Rumah" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/distribusi-pangan" icon={<Package size={18} />} label="Distribusi Pangan" onClick={closeSidebarOnMobile} />
            <SidebarLink to="/penyaluran-bantuan" icon={<DollarSign size={18} />} label="Penyaluran Bantuan" onClick={closeSidebarOnMobile} />
            {(user?.role === 'admin' || user?.role === 'supervisor') && (
              <SidebarLink to="/approval-penyaluran" icon={<ClipboardCheck size={18} />} label="Approval Penyaluran" onClick={closeSidebarOnMobile} />
            )}
          </AccordionGroup>

          <AccordionGroup 
            title="Monitoring & Evaluasi" 
            icon={<FileText size={20} />} 
            isExpanded={expandedMenus.includes('monitoring')}
            onToggle={() => toggleMenu('monitoring')}
          >
            {user?.role === 'admin' && (
              <>
                <SidebarLink to="/kinerja-petugas" icon={<BarChart3 size={18} />} label="Kinerja Petugas" onClick={closeSidebarOnMobile} />
                <SidebarLink to="/evaluasi-capaian" icon={<Target size={18} />} label="Evaluasi Capaian" onClick={closeSidebarOnMobile} />
              </>
            )}
            <SidebarLink to="/laporan" icon={<FileText size={18} />} label="Laporan" onClick={closeSidebarOnMobile} />
          </AccordionGroup>
        </nav>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleSidebar}
              style={{ background: 'transparent', border: 'none', color: 'var(--pk-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
            <h3 style={{ margin: 0, fontWeight: 400 }}>Sistem Monitoring & Evaluasi</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleTheme} 
              style={{ background: 'rgba(128, 128, 128, 0.1)', border: '1px solid var(--pk-glass-border)', color: 'var(--pk-text)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--pk-transition)' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => navigate('/notifikasi')}
                style={{ background: 'rgba(128, 128, 128, 0.1)', border: '1px solid var(--pk-glass-border)', color: 'var(--pk-text)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--pk-transition)' }}
                title="Notifikasi"
              >
                <Bell size={18} />
              </button>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'var(--pk-danger)', color: '#fff',
                  borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
                  minWidth: '18px', height: '18px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', lineHeight: 1, border: '2px solid var(--pk-bg-1)',
                  animation: 'notifPulse 2s infinite'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>

            <span className="badge badge-success" style={{ textTransform: 'capitalize', display: window.innerWidth <= 480 ? 'none' : 'inline-block' }}>
              {user?.role?.replace('_', ' ')}
            </span>
            
            {/* Profile Menu Container */}
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '2px solid var(--pk-primary)', cursor: 'pointer', transition: 'var(--pk-transition)' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src="/user.png" alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: theme === 'light' ? 'invert(1)' : 'none', transition: 'var(--pk-transition)' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                <span style={{ display: 'none', fontWeight: 'bold', color: 'var(--pk-primary)' }}>{user?.name?.charAt(0).toUpperCase()}</span>
              </div>

              {/* Dropdown UI */}
              {isProfileMenuOpen && (
                <div className="animate-fade-in" style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, width: '220px', 
                  background: 'var(--pk-glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--pk-glass-border)',
                  borderRadius: '12px', boxShadow: 'var(--pk-glass-shadow)', padding: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1050
                }}>
                  <div style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--pk-text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
                    <p style={{ margin: 0, color: 'var(--pk-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'user@example.com'}</p>
                  </div>                  

                  <button 
                    onClick={handleLogout} 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--pk-danger)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'var(--pk-transition)', fontSize: '0.9rem', width: '100%' }} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
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