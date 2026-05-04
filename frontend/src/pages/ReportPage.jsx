import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';

const ReportPage = () => {
  const { user } = useContext(AuthContext);
  const [filterData, setFilterData] = useState({
    startDate: '',
    endDate: '',
    wilayah: ''
  });

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
        </div>

        {/* Kontainer kosong untuk tabel pratinjau yang akan diimplementasikan nanti */}
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--pk-text-muted)' }}>
          <p>Tabel pratinjau data laporan akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
