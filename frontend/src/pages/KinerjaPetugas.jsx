import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Package, FileCheck, Star, Activity, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';

const StatCard = ({ title, value, icon, borderColor, iconColor }) => (
  <div className="glass-panel" style={{ 
    borderTop: `4px solid ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem'
  }}>
    <div style={{ 
      width: '50px', 
      height: '50px', 
      borderRadius: '12px', 
      background: 'var(--pk-highlight)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: iconColor
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--pk-text-muted)' }}>{title}</p>
      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{value}</h3>
    </div>
  </div>
);

const KinerjaPetugas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchKinerja = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kinerja-petugas');
      setData(res.data);
    } catch (e) {
      console.error(e);
      setErrorMsg('Gagal memuat data kinerja petugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKinerja();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Exceeds Target':
        return <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>{status}</span>;
      case 'On Track':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>{status}</span>;
      default:
        return <span className="badge badge-danger">{status}</span>;
    }
  };

  const handleCetakLaporan = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading data kinerja...</div>;
  if (errorMsg) return <div style={{ padding: '2rem', color: 'var(--pk-danger)' }}>{errorMsg}</div>;
  if (!data) return null;

  return (
    <div className="kinerja-petugas-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Kinerja Petugas Lapangan</h2>
          <p>Monitoring produktivitas dan pencapaian petugas lapangan bulan ini</p>
        </div>
        <button className="btn btn-primary" onClick={handleCetakLaporan}>
          <Activity size={18} /> Cetak Laporan Kinerja
        </button>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard 
          title="Total Kunjungan Rumah" 
          value={data.summary.total_kunjungan} 
          icon={<Users size={24} />} 
          borderColor="#c084fc" /* Ungu */
          iconColor="#c084fc"
        />
        <StatCard 
          title="Total Distribusi Bantuan" 
          value={data.summary.total_distribusi} 
          icon={<Package size={24} />} 
          borderColor="#34d399" /* Hijau */
          iconColor="#34d399"
        />
        <StatCard 
          title="Pendaftaran Disetujui" 
          value={data.summary.total_pendaftaran_disetujui} 
          icon={<FileCheck size={24} />} 
          borderColor="#60a5fa" /* Biru */
          iconColor="#60a5fa"
        />
        <StatCard 
          title="Petugas Terbaik Bulan Ini" 
          value={data.summary.petugas_terbaik ? data.summary.petugas_terbaik.nama.split(' ')[0] : '-'} 
          icon={<Star size={24} />} 
          borderColor="#fbbf24" /* Gold */
          iconColor="#fbbf24"
        />
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--pk-primary)" />
          Analisis Perbandingan Kinerja
        </h3>
        
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={data.chart_data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--pk-glass-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--pk-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--pk-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--pk-highlight)' }}
                contentStyle={{ backgroundColor: 'var(--pk-bg-3)', borderColor: 'var(--pk-glass-border)', borderRadius: '8px', color: 'var(--pk-text)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Kunjungan" fill="#c084fc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Distribusi" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pendaftaran" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={20} color="var(--pk-primary)" />
          Peringkat Produktivitas
        </h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Nama Petugas</th>
                <th>Jumlah Kunjungan</th>
                <th>Jumlah Distribusi</th>
                <th>Jumlah Pendaftaran</th>
                <th>Total Poin</th>
                <th>Status Kinerja</th>
              </tr>
            </thead>
            <tbody>
              {data.peringkat_produktivitas.map(item => (
                <tr key={item.petugas_id}>
                  <td style={{ fontWeight: 600 }}>#{item.peringkat}</td>
                  <td style={{ fontWeight: 500 }}>{item.nama}</td>
                  <td>{item.kunjungan}</td>
                  <td>{item.distribusi}</td>
                  <td>{item.pendaftaran}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--pk-primary)' }}>{item.poin}</td>
                  <td>{renderStatusBadge(item.status)}</td>
                </tr>
              ))}
              {data.peringkat_produktivitas.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign:'center', padding: '2rem' }}>Belum ada data kinerja petugas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KinerjaPetugas;
