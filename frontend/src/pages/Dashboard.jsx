import React, { useContext, useState, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ background: `rgba(255,255,255,0.05)`, padding: '1rem', borderRadius: '12px', color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: '2rem' }}>{value}</h2>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: '-', penerima: '-', pending: '-', verified: '-' });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        const data = res.data.data;
        
        setStats({
          users: user?.role === 'admin' ? data.users : '-',
          penerima: data.penerima,
          pending: data.pending,
          verified: data.verified
        });

        setRecentActivities(data.recent_activities || []);

      } catch (e) {
        console.error("Dashboard data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) fetchDashboardData();
  }, [user]);

  return (
    <div>
      <style>{`@keyframes spin-slow { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Welcome back, <span>{user?.name}</span>!</h1>
          <p style={{ color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>System Overview and Quick Actions</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn btn-primary"
          style={{ 
            borderRadius: '99px',
            padding: '0.75rem 1.75rem',
            background: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'var(--pk-text)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: loading ? 'scale(0.98)' : 'scale(1)'
          }}
          onMouseOver={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)'; } }}
          onMouseOut={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; } }}
        >
          <RefreshCw size={18} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-4 mb-4" style={{ marginBottom: '2rem' }}>
        <StatCard title="Total Users" value={stats.users} icon={<Users size={28} />} color="var(--pk-primary)" />
        <StatCard title="Penerima Bantuan" value={stats.penerima} icon={<FileText size={28} />} color="var(--pk-secondary)" />
        <StatCard title="Menunggu Verifikasi" value={stats.pending} icon={<CheckCircle size={28} />} color="var(--pk-warning)" />
        <StatCard title="Verifikasi Selesai" value={stats.verified} icon={<CheckCircle size={28} />} color="var(--pk-success)" />
      </div>

      <div className="glass-panel" style={{ minHeight: '300px' }}>
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} /> Recent Activities
        </h3>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>Loading activities...</p>
        ) : recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map(activity => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'var(--pk-transition)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--pk-text)', fontSize: '1.05rem' }}>Pendaftaran Baru</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>
                    Registrasi calon penerima bantuan atas nama <strong style={{ color: 'var(--pk-text)' }}>{activity.nama}</strong> ({activity.nik}) berhasil ditambahkan.
                  </p>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '99px' }}>
                  <Clock size={14} /> Baru Saja
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
            Belum ada aktivitas pendaftaran bantuan terbaru.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
