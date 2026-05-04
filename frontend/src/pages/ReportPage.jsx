import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText, Table, FolderOpen } from 'lucide-react';
import api from '../api';

const ReportPage = () => {
  const { user } = useContext(AuthContext);
  const [filterData, setFilterData] = useState({
    startDate: '',
    endDate: '',
    wilayah: ''
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExport = async (format) => {
    if (format === 'pdf') setExportingPDF(true);
    else setExportingExcel(true);

    try {
      const res = await api.get('/reports/export', {
        params: {
          start_date: filterData.startDate,
          end_date: filterData.endDate,
          wilayah: filterData.wilayah,
          format: format
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = 'csv'; 
      link.setAttribute('download', `Laporan-SiMonEv.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log('Error Response:', error.response);
      console.error(`Gagal mengekspor data ke ${format.toUpperCase()}:`, error);
      
      let errorMessage = 'Gagal mengunduh file laporan. Pastikan endpoint export sudah siap di backend.';
      
      if (error.response && error.response.data instanceof Blob) {
        try {
          const textData = await error.response.data.text();
          const jsonData = JSON.parse(textData);
          if (jsonData.message) {
            errorMessage = jsonData.message;
          }
        } catch (e) {
          console.error('Failed to parse error blob as JSON', e);
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      if (format === 'pdf') setExportingPDF(false);
      else setExportingExcel(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports', {
        params: {
          start_date: filterData.startDate,
          end_date: filterData.endDate,
          wilayah: filterData.wilayah
        }
      });
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterData.startDate, filterData.endDate, filterData.wilayah]);

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
              onClick={() => handleExport('pdf')}
              disabled={exportingPDF || reports.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', opacity: (exportingPDF || reports.length === 0) ? 0.6 : 1, cursor: (exportingPDF || reports.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {exportingPDF ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#ef4444' }}></div> : <FileText size={16} />}
              {exportingPDF ? 'Memproses...' : 'Ekspor PDF'}
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => handleExport('excel')}
              disabled={exportingExcel || reports.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', opacity: (exportingExcel || reports.length === 0) ? 0.6 : 1, cursor: (exportingExcel || reports.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {exportingExcel ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#10b981' }}></div> : <Table size={16} />}
              {exportingExcel ? 'Memproses...' : 'Ekspor Excel'}
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
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--pk-text-muted)' }}>
                    <div className="spinner" style={{ borderTopColor: 'var(--pk-primary)', margin: '0 auto 1rem' }}></div>
                    Memuat data laporan...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--pk-text)' }}>
                        {item.nama_program}
                      </div>
                    </td>
                    <td>{item.tanggal ? item.tanggal.split('-').reverse().join('-') : '-'}</td>
                    <td>{item.wilayah}</td>
                    <td>
                      <span className={`badge ${['Aktif', 'Selesai', 'disetujui'].includes(item.status) ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--pk-text-muted)' }}>
                    <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--pk-primary)' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Belum ada data untuk periode ini</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.7 }}>Silakan sesuaikan filter tanggal atau wilayah di atas.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
