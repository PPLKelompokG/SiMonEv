import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, CheckCircle } from 'lucide-react';

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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Welcome back, {user?.name}!</h1>
        <p>System Overview and Quick Actions</p>
      </div>

      <div className="grid grid-cols-4 mb-4" style={{ marginBottom: '2rem' }}>
        <StatCard title="Total Users" value="-" icon={<Users size={28} />} color="var(--pk-primary)" />
        <StatCard title="Penerima Bantuan" value="-" icon={<FileText size={28} />} color="var(--pk-secondary)" />
        <StatCard title="Menunggu Verifikasi" value="-" icon={<CheckCircle size={28} />} color="var(--pk-warning)" />
        <StatCard title="Verifikasi Selesai" value="-" icon={<CheckCircle size={28} />} color="var(--pk-success)" />
      </div>

      <div className="glass-panel" style={{ minHeight: '300px' }}>
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          Recent Activities
        </h3>
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
          No recent activities found.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
