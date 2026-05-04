import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText, Table } from 'lucide-react';

const ReportPage = () => {
  const { user } = useContext(AuthContext);
  const [filterData, setFilterData] = useState({
    startDate: '',
    endDate: '',
    wilayah: ''
  });

  const [dummyData] = useState([
    { id: 1, nama_program: 'Bantuan Pangan Non Tunai', tanggal: '2026-05-01', wilayah: 'Kecamatan A', status: 'Selesai' },
    { id: 2, nama_program: 'Program Keluarga Harapan', tanggal: '2026-05-02', wilayah: 'Kecamatan B', status: 'Proses' },
    { id: 3, nama_program: 'Bantuan Langsung Tunai', tanggal: '2026-05-03', wilayah: 'Kelurahan C', status: 'Tertunda' },
    { id: 4, nama_program: 'Bantuan Pendidikan Anak', tanggal: '2026-05-04', wilayah: 'Kecamatan A', status: 'Selesai' },
    { id: 5, nama_program: 'Subsidi Listrik', tanggal: '2026-05-05', wilayah: 'Kelurahan D', status: 'Proses' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--pk-text)', marginBottom: '0.25rem' }}>
            Laporan & Ekspor
          </h1>
          <p style={{ color: 'var(--pk-text-muted)', margin: 0 }}>
            Pratinjau data program bantuan dan ekspor laporan ke dalam format file.
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
          >
            <Download size={18} />
            Ekspor Data
          </button>
        )}
      </div>

      <div className="card glass-effect" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 600, fontSize: '1.1rem', color: 'var(--pk-text)' }}>Filter Data Laporan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Mulai</label>
            <input 
              type="date" 
              className="form-control" 
              value={filterData.startDate} 
              onChange={e => setFilterData({...filterData, startDate: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Selesai</label>
            <input 
              type="date" 
              className="form-control" 
              value={filterData.endDate} 
              onChange={e => setFilterData({...filterData, endDate: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Kecamatan/Kelurahan</label>
            <select 
              className="form-control" 
              value={filterData.wilayah} 
              onChange={e => setFilterData({...filterData, wilayah: e.target.value})}
            >
              <option value="">Semua Wilayah</option>
              <option value="Kecamatan A">Kecamatan A</option>
              <option value="Kecamatan B">Kecamatan B</option>
              <option value="Kelurahan C">Kelurahan C</option>
              <option value="Kelurahan D">Kelurahan D</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card glass-effect" style={{ padding: '1.5rem', marginBottom: '2rem', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--pk-glass-border)', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <FileText size={20} style={{ color: 'var(--pk-primary)' }} />
            Pratinjau Laporan
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <FileText size={16} /> Ekspor PDF
            </button>
            <button 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}
            >
              <Table size={16} /> Ekspor Excel
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '5%', textAlign: 'center' }}>No</th>
                <th>Nama Program</th>
                <th>Tanggal</th>
                <th>Wilayah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>
                      {item.nama_program}
                    </div>
                  </td>
                  <td>{item.tanggal}</td>
                  <td>{item.wilayah}</td>
                  <td>
                    <span className={`badge ${item.status === 'Selesai' ? 'badge-success' : item.status === 'Tertunda' ? 'badge-danger' : 'badge-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
