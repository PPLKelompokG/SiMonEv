import React, { useContext, useState, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch penerima bantuan list
        const penerimaRes = await api.get('/penerima-bantuan');
        const penerimaData = penerimaRes.data.data || [];
        
        let usersCount = '-';
        try {
           if (user?.role === 'admin') {
             const userRes = await api.get('/users');
             usersCount = userRes.data.data?.length || 0;
           }
        } catch (e) { console.error('Gagal fetch users', e); }

        const pendingCount = penerimaData.filter(p => p.status !== 'disetujui' && p.status !== 'ditolak').length;
        const verifiedCount = penerimaData.filter(p => ['disetujui', 'ditolak'].includes(p.status)).length;
        
        setStats({
          users: usersCount,
          penerima: penerimaData.length,
          pending: pendingCount,
          verified: verifiedCount
        });

        // Set recent activities by mapping the 5 most recently added records
        const sortedPenerima = [...penerimaData].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentActivities(sortedPenerima);

      } catch (e) {
        console.error("Dashboard data fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    if(user) fetchDashboardData();
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Welcome back, {user?.name}!</h1>
        <p>System Overview and Quick Actions</p>
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
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--pk-secondary), rgba(59, 130, 246, 0.2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--pk-text)', fontSize: '1.05rem' }}>Pendaftaran Baru</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--pk-text-muted)', marginTop: '0.25rem' }}>
                    Registrasi calon penerima bantuan atas nama <strong style={{ color: 'var(--pk-primary)' }}>{activity.nama}</strong> ({activity.nik}) berhasil ditambahkan.
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
