import React, { useState, useEffect } from 'react';
import api from '../api';
import { Send, Clock, RotateCcw, MessageSquare, AlertCircle } from 'lucide-react';

const PermintaanKuota = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [requestedQuota, setRequestedQuota] = useState('');
  const [justification, setJustification] = useState('');
  const [history, setHistory] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch programs and request history
      const [programsRes, historyRes] = await Promise.all([
        api.get('/permintaan-kuota/programs'),
        api.get('/permintaan-kuota')
      ]);

      if (programsRes.data.success) {
        setProgramOptions(programsRes.data.data);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedProgramData = programOptions.find(p => p.id === parseInt(selectedProgram));
  const currentQuota = selectedProgramData ? selectedProgramData.kuota : '';
  const totalAfter = (selectedProgramData && requestedQuota) ? (parseInt(currentQuota) + parseInt(requestedQuota)) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram || !requestedQuota || !justification) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/permintaan-kuota', {
        program_bantuan_id: parseInt(selectedProgram),
        jumlah_kuota: parseInt(requestedQuota),
        justifikasi: justification
      });

      if (res.data.success) {
        setSuccess('Permintaan kuota berhasil diajukan!');
        handleReset();
        // Reload history and programs to update quotas
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pengajuan permintaan kuota.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProgram('');
    setRequestedQuota('');
    setJustification('');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-success">Approved</span>;
      case 'Rejected': return <span className="badge badge-danger">Rejected</span>;
      default: return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Permintaan Kuota</h2>
          <p>Ajukan kuota program tambahan</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      <div className="card-premium" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <MessageSquare size={20} /> Ajukan Permintaan Kuota
        </h3>

        {loading ? (
          <p>Loading form...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Program*</label>
                <select 
                  className="form-control" 
                  value={selectedProgram} 
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  required
                  style={{ color: 'var(--pk-text)' }}
                >
                  <option value="" style={{background: 'var(--pk-bg-2)'}}>Pilih program</option>
                  {programOptions.map(p => (
                    <option key={p.id} value={p.id} style={{background: 'var(--pk-bg-2)'}}>{p.nama_program}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Kuota Saat Ini</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentQuota} 
                  disabled 
                  placeholder="-"
                  style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Kuota Tambahan yang Diminta*</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={requestedQuota} 
                  onChange={(e) => setRequestedQuota(e.target.value)}
                  required 
                  placeholder="Masukkan kuota tambahan yang diperlukan"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Total Setelah Persetujuan</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={totalAfter} 
                  disabled 
                  placeholder="-"
                  style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Justifikasi*</label>
              <textarea 
                className="form-control" 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required 
                rows="3"
                placeholder="Jelaskan mengapa kuota tambahan diperlukan..."
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Send size={18} /> {submitting ? 'Mengirim...' : 'Ajukan Permintaan'}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset} disabled={submitting}>
                <RotateCcw size={18} /> Reset
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card-premium">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <Clock size={20} /> Riwayat Permintaan
        </h3>

        {loading ? (
          <p>Loading history...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Program</th>
                  <th>Kuota Diminta</th>
                  <th>Justifikasi</th>
                  <th>Diajukan Oleh</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td style={{ fontWeight: 500 }}>{item.program_bantuan?.nama_program}</td>
                    <td>{item.jumlah_kuota}</td>
                    <td style={{ color: 'var(--pk-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.justifikasi}>
                      {item.justifikasi}
                    </td>
                    <td>{item.requester?.name || '-'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-text-muted)' }}>
                Belum ada riwayat permintaan kuota.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermintaanKuota;
