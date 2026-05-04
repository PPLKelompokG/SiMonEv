import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';

const ReportPage = () => {
  const { user } = useContext(AuthContext);

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
