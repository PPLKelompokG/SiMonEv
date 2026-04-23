import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckSquare, XSquare, PackageSearch, AlertCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const ApprovalPenyaluran = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // { item, action: 'approve' | 'reject' }
  const [catatan, setCatatan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/approval/penyaluran');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
      setErrorMsg('Gagal memuat data laporan penyaluran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const { item, action } = actionModal;
      
      if (action === 'reject' && (!catatan || catatan.length < 5)) {
        setErrorMsg('Catatan koreksi wajib diisi (minimal 5 karakter)');
        return;
      }

      if (action === 'approve') {
        await api.put(`/approval/penyaluran/${item.id}/approve`);
      } else {
        await api.put(`/approval/penyaluran/${item.id}/reject`, {
          catatan_koreksi: catatan
        });
      }

      setActionModal(null);
      fetchLaporan();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat memproses laporan');
    }
  };

  const openModal = (item, action) => {
    setActionModal({ item, action });
    setCatatan('');
    setErrorMsg('');
  };

  const renderBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Disetujui</span>;
      case 'returned':
        return <span className="badge badge-danger">Dikembalikan</span>;
      default:
        return <span className="badge badge-warning">Menunggu</span>;
    }
  };

  const chartData = [
    { name: 'Pending', jumlah: data.filter(d => d.status_approval === 'pending').length, color: '#f59e0b' },
    { name: 'Disetujui', jumlah: data.filter(d => d.status_approval === 'approved').length, color: '#10b981' },
    { name: 'Dikembalikan', jumlah: data.filter(d => d.status_approval === 'returned').length, color: '#ef4444' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Approval Laporan Penyaluran</h2>
        <p>Validasi laporan penyaluran bantuan yang dicatat oleh petugas lapangan</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--pk-primary)" />
          Statistik Approval
        </h3>
        {loading ? (
          <p>Loading statistik...</p>
        ) : (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--pk-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--pk-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--pk-bg)', borderColor: 'var(--pk-glass-border)', borderRadius: '8px', color: 'var(--pk-text)' }}
                />
                <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h3 style={{ borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PackageSearch size={20} color="var(--pk-primary)" />
          Daftar Laporan Penyaluran
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Penerima</th>
                  <th>Bantuan</th>
                  <th>Petugas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.tanggal_penyaluran).toLocaleDateString('id-ID')}</td>
                    <td>{item.penerima_bantuan?.nama || '-'}</td>
                    <td>{item.jenis_bantuan} - Rp {Number(item.jumlah_bantuan).toLocaleString('id-ID')}</td>
                    <td>{item.petugas_penyalur?.name || '-'}</td>
                    <td>{renderBadge(item.status_approval)}</td>
                    <td>
                      {item.status_approval === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-success" style={{ padding: '0.4rem 0.6rem' }} onClick={() => openModal(item, 'approve')}>
                            <CheckSquare size={16} /> Setuju
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => openModal(item, 'reject')}>
                            <XSquare size={16} /> Kembali
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--pk-text-muted)' }}>
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign:'center', padding: '2rem' }}>Belum ada laporan penyaluran.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--pk-bg-secondary)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: actionModal.action === 'approve' ? 'var(--pk-success)' : 'var(--pk-danger)' }}>
              Konfirmasi {actionModal.action === 'approve' ? 'Persetujuan' : 'Pengembalian'} Laporan
            </h3>
            
            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Detail Laporan:</strong></p>
              <p style={{ margin: '0 0 0.2rem 0' }}>Penerima: {actionModal.item.penerima_bantuan?.nama}</p>
              <p style={{ margin: '0 0 0.2rem 0' }}>Jenis: {actionModal.item.jenis_bantuan}</p>
              <p style={{ margin: '0 0 0.2rem 0' }}>Jumlah: Rp {Number(actionModal.item.jumlah_bantuan).toLocaleString('id-ID')}</p>
              <p style={{ margin: '0' }}>Petugas: {actionModal.item.petugas_penyalur?.name}</p>
            </div>
            
            {errorMsg && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--pk-danger)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--pk-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {actionModal.action === 'reject' && (
                <div className="form-group">
                  <label className="form-label">Catatan Koreksi (Wajib)</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    value={catatan} 
                    onChange={e => setCatatan(e.target.value)} 
                    placeholder="Masukkan alasan kenapa laporan dikembalikan..."
                    required
                  ></textarea>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActionModal(null)}>Batal</button>
                <button type="submit" className={`btn ${actionModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                  {actionModal.action === 'approve' ? 'Setujui Laporan' : 'Kembalikan Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPenyaluran;
